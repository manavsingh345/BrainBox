import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantClient } from "@qdrant/js-client-rest";
import { connectToDatabase, Linkfile, PDFfile, Thread } from "@mysecondbrain/db";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";
import { createDocumentEmbeddings, embedDocumentsSafely } from "../utils/rag.js";

dotenv.config();

connectToDatabase(process.env.MONGO_URL || "")
  .then(() => console.log("Worker connected to DB"))
  .catch((err) => console.error("Worker DB error:", err));

const setPdfStatus = async (
  pdfId: string | undefined,
  status: "pending" | "processing" | "ready" | "failed",
  lastError = ""
) => {
  if (!pdfId) return;
  await PDFfile.findByIdAndUpdate(pdfId, {
    processingStatus: status,
    lastError,
    embedded: status === "ready",
  }).catch(() => {});
};

const setLinkStatus = async (
  linkId: string | undefined,
  status: "pending" | "processing" | "ready" | "failed",
  lastError = ""
) => {
  if (!linkId) return;
  await Linkfile.findByIdAndUpdate(linkId, {
    processingStatus: status,
    lastError,
    embedded: status === "ready",
  }).catch(() => {});
};

const setYoutubeStatus = async (
  threadId: string | undefined,
  userId: string | undefined,
  videoId: string | undefined,
  status: "pending" | "processing" | "ready" | "failed",
  lastError = ""
) => {
  if (!threadId || !userId || !videoId) return;
  await Thread.updateOne(
    { threadId, userId, "youtubeItems.videoId": videoId },
    {
      $set: {
        "youtubeItems.$.processingStatus": status,
        "youtubeItems.$.lastError": lastError,
      },
    }
  ).catch(() => {});
};

const ensureQdrantCollection = async (
  client: QdrantClient,
  collectionName: string,
  vectorSize: number
) => {
  const collections = await client.getCollections();
  const exists = collections.collections.some(
    (collection) => collection.name === collectionName
  );

  if (exists) {
    return;
  }

  await client.createCollection(collectionName, {
    vectors: {
      size: vectorSize,
      distance: "Cosine",
    },
  });
};

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    const rawData = job.data as Record<string, unknown> | string;
    const preview =
      typeof rawData === "string"
        ? { rawType: "string", size: rawData.length }
        : {
            type: rawData?.type,
            pdfId: rawData?.pdfId,
            userId: rawData?.userId,
            filename: rawData?.filename,
            path: rawData?.path,
            hasFileData: Boolean(rawData?.fileData),
          };
    console.log("Job received:", job.id, preview);

    let data: any;
    try {
      data = typeof job.data === "string" ? JSON.parse(job.data) : job.data;
    } catch (err) {
      console.error("Failed to parse job.data:", err, "raw:", job.data);
      return;
    }

    const {
      type = "pdf",
      pdfId,
      userId,
      filename,
      path: fileUrl,
      fileData,
      text,
      videoId,
      linkId,
      threadId,
    } = data;

    let docs: Array<{ pageContent: string; metadata: Record<string, string> }> | undefined;

    if (type === "pdf") {
      await setPdfStatus(pdfId, "processing");
      console.log("Started PDF processing:", { jobId: job.id, pdfId, filename });
    }
    if (type === "link") {
      await setLinkStatus(linkId, "processing");
    }
    if (type === "youtube") {
      await setYoutubeStatus(threadId, userId, videoId, "processing");
    }

    const failJob = async (message: string) => {
      console.error(message);
      if (type === "pdf") {
        await setPdfStatus(pdfId, "failed", message);
      }
      if (type === "link") {
        await setLinkStatus(linkId, "failed", message);
      }
      if (type === "youtube") {
        await setYoutubeStatus(threadId, userId, videoId, "failed", message);
      }
    };

    if (type === "pdf" && (!pdfId || !userId || (!fileUrl && !fileData))) {
      await failJob("Missing required PDF job fields");
      return;
    }

    if (type === "youtube") {
      if (!text || !userId || !videoId) {
        await failJob("Missing YouTube job fields");
        return;
      }
      docs = [
        {
          pageContent: text,
          metadata: {
            type: "youtube",
            videoId: videoId.toString(),
            userId: userId.toString(),
          },
        },
      ];
    }

    if (type === "link") {
      if (!text || !userId || !linkId) {
        await failJob("Missing link job fields");
        return;
      }
      docs = [
        {
          pageContent: text,
          metadata: {
            type: "link",
            linkId: linkId.toString(),
            userId: userId.toString(),
          },
        },
      ];
    }

    if (type === "pdf") {
      const tmpFile = path.join(
        os.tmpdir(),
        `file-${Date.now()}-${encodeURIComponent(filename || "file")}`
      );

      try {
        if (fileData) {
          fs.writeFileSync(tmpFile, Buffer.from(fileData, "base64"));
        } else {
          console.log("Downloading PDF from storage:", { jobId: job.id, pdfId, filename });
          const response = await axios.get(fileUrl, {
            responseType: "arraybuffer",
            timeout: 60_000,
          });
          if (!response.data || response.data.byteLength === 0) {
            await failJob("Downloaded file is empty");
            return;
          }
          fs.writeFileSync(tmpFile, Buffer.from(response.data));
        }
      } catch (err) {
        await failJob(`Error downloading file: ${err instanceof Error ? err.message : "Unknown error"}`);
        return;
      }

      let loader: any;
      const lower = (filename || "").toLowerCase();
      try {
        if (lower.endsWith(".pdf")) {
          const { PDFLoader } = await import("@langchain/community/document_loaders/fs/pdf");
          loader = new PDFLoader(tmpFile);
        } else if (lower.endsWith(".docx")) {
          const { DocxLoader } = await import("@langchain/community/document_loaders/fs/docx");
          loader = new DocxLoader(tmpFile);
        } else if (lower.endsWith(".pptx")) {
          const { PPTXLoader } = await import("@langchain/community/document_loaders/fs/pptx");
          loader = new PPTXLoader(tmpFile);
        } else {
          if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
          await failJob("Unsupported file type");
          return;
        }
      } catch (err) {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        await failJob(`Error creating loader: ${err instanceof Error ? err.message : "Unknown error"}`);
        return;
      }

      try {
        const loadedDocs = await loader.load();
        docs = loadedDocs;
        console.log("Parsed document pages:", {
          jobId: job.id,
          pdfId,
          filename,
          pages: loadedDocs.length,
        });
      } catch (err) {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        await failJob(`Error parsing file: ${err instanceof Error ? err.message : "Unknown error"}`);
        return;
      }

      try {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      } catch {}

      if (!docs || docs.length === 0) {
        await failJob("No readable content extracted from file");
        return;
      }
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 100,
    });

    let splitDocs;
    try {
      if (!docs) {
        await failJob("No documents available to split");
        return;
      }
      splitDocs = await splitter.splitDocuments(docs as any);
    } catch (err) {
      await failJob(`Error splitting documents: ${err instanceof Error ? err.message : "Unknown error"}`);
      return;
    }

    if (!splitDocs || splitDocs.length === 0) {
      await failJob("Splitter returned zero chunks");
      return;
    }

    console.log("Split document into chunks:", {
      jobId: job.id,
      pdfId,
      chunks: splitDocs.length,
    });

    splitDocs = splitDocs.map((doc: any) => ({
      ...doc,
      metadata: {
        ...(doc.metadata || {}),
        userId: userId.toString(),
        type,
        ...(type === "pdf" && pdfId && { pdfId: pdfId.toString() }),
        ...(type === "youtube" && videoId && { videoId: videoId.toString() }),
        ...(type === "link" && linkId && { linkId: linkId.toString() }),
      },
    }));

    try {
      const { docs: validDocs, vectors } = await embedDocumentsSafely(splitDocs);
      if (validDocs.length === 0 || vectors.length === 0) {
        await failJob("No valid embeddings were generated for this job");
        return;
      }
      console.log("Generated embeddings:", {
        jobId: job.id,
        pdfId,
        chunks: validDocs.length,
      });

      const embeddings = createDocumentEmbeddings();
      const collectionName = `user_${userId}`;
      const qdrantClient = new QdrantClient({
        url: process.env.QDRANT_URL || "http://localhost:6333",
        apiKey: process.env.QDRANT_API_KEY || undefined,
        checkCompatibility: false,
      });

      console.log("Ensuring Qdrant collection:", {
        jobId: job.id,
        collectionName,
        vectorSize: vectors[0].length,
      });
      await ensureQdrantCollection(qdrantClient, collectionName, vectors[0].length);

      const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        client: qdrantClient,
        collectionName,
      });

      try {
        if (type === "pdf" && pdfId) {
          await vectorStore.client.delete(collectionName, {
            filter: {
              must: [{ key: "metadata.pdfId", match: { value: pdfId.toString() } }],
            },
          });
        }
        if (type === "link" && linkId) {
          await vectorStore.client.delete(collectionName, {
            filter: {
              must: [{ key: "metadata.linkId", match: { value: linkId.toString() } }],
            },
          });
        }
        if (type === "youtube" && videoId) {
          await vectorStore.client.delete(collectionName, {
            filter: {
              must: [{ key: "metadata.videoId", match: { value: videoId.toString() } }],
            },
          });
        }
      } catch (err) {
        console.warn("Failed to delete old vectors (continuing):", err);
      }

      await vectorStore.addVectors(vectors, validDocs);
    } catch (err) {
      await failJob(
        `Failed to add documents to vector store: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      return;
    }

    if (type === "pdf") {
      await setPdfStatus(pdfId, "ready");
      console.log("PDF chunks stored in Qdrant for:", { jobId: job.id, pdfId, filename });
    }
    if (type === "link") {
      await setLinkStatus(linkId, "ready");
      console.log("Link chunks stored in Qdrant for:", linkId);
    }
    if (type === "youtube") {
      await setYoutubeStatus(threadId, userId, videoId, "ready");
      console.log("YouTube chunks stored in Qdrant for:", videoId);
    }
  },
  {
    concurrency: 10,
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT || 6379),
    },
  }
);

export default worker;
