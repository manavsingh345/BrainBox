import express from "express";
import crypto from "crypto";
import multer from "multer";
import axios from "axios";
import "dotenv/config";
import {
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { YoutubeTranscript } from "youtube-transcript/dist/youtube-transcript.esm.js";
import { Linkfile, PDFfile, Thread, UserModel } from "@mysecondbrain/db";
import generateOpenAiResponse from "../utils/openai.js";
import { authMiddleware } from "../middleware.js";
import cloudinary from "../uploadCloudinary.js";
import { generateTitleFromMessage } from "../utils/summary.js";
import { getUploadQueue } from "../queue.js";
import {
  createQueryEmbeddings,
  extractReadableContentFromHtml,
} from "../utils/rag.js";
import {
  canonicalizeUrl,
  chatRequestSchema,
  classifyFetchedContentType,
  detectWrongSectionForUrl,
  linkUploadSchema,
  pdfUploadBodySchema,
  validateFileUpload,
  youtubeUploadSchema,
} from "../utils/uploadValidation.js";

const router = express.Router();
const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

type TranscriptLine = {
  text: string;
  duration: number;
  offset: number;
  lang: string;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
});

const addQueueJob = async (payload: Record<string, unknown>) => {
  const queue = getUploadQueue();
  await queue.waitUntilReady();
  return queue.add("file-upload-queue", payload);
};

const requireUpgrade = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(req.userId).select("isUpgraded");
    if (!user || !user.isUpgraded) {
      return res.status(403).json({
        message: "Upgrade required for uploads",
        upgradeRequired: true,
        redirectTo: "/pricing",
      });
    }

    return next();
  } catch (error) {
    console.error("Upgrade check failed:", error);
    return res.status(500).json({ message: "Failed to validate subscription" });
  }
};

const ensureThread = async ({
  threadId,
  userId,
  title,
}: {
  threadId?: string;
  userId: string;
  title: string;
}) => {
  if (threadId) {
    const existing = await Thread.findOne({ threadId, userId });
    if (existing) {
      return existing;
    }
    return Thread.create({
      threadId,
      title,
      messages: [],
      userId,
      pdfId: [],
      youtubeIds: [],
      youtubeItems: [],
      linkIds: [],
    });
  }

  return Thread.create({
    threadId: Date.now().toString(),
    title,
    messages: [],
    userId,
    pdfId: [],
    youtubeIds: [],
    youtubeItems: [],
    linkIds: [],
  });
};

const buildProcessingMessage = (
  pendingItems: Array<{ type: string; label: string; status: string; error?: string }>
) => {
  const failures = pendingItems.filter((item) => item.status === "failed");
  if (failures.length > 0) {
    return `Some context failed to process: ${failures
      .map((item) => `${item.label}${item.error ? ` (${item.error})` : ""}`)
      .join(", ")}.`;
  }

  const uniqueTypes = pendingItems
    .map((item) => item.type)
    .filter((value, index, array) => array.indexOf(value) === index);

  return `I'm still processing your ${uniqueTypes.join(", ")} context. Please try again in a moment.`;
};

const extractVideoId = (url: string) => {
  const patterns = [
    /v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /shorts\/([^?]+)/,
    /embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getAttachmentStatusSummary = async (thread: any, userId: string) => {
  const pdfs =
    Array.isArray(thread.pdfId) && thread.pdfId.length > 0
      ? await PDFfile.find({ _id: { $in: thread.pdfId }, userId }).select(
          "_id originalName processingStatus lastError embedded"
        )
      : [];

  const links =
    Array.isArray(thread.linkIds) && thread.linkIds.length > 0
      ? await Linkfile.find({ _id: { $in: thread.linkIds }, userId }).select(
          "_id title url contentText processingStatus lastError embedded"
        )
      : [];

  const youtubeItems = Array.isArray(thread.youtubeItems) ? thread.youtubeItems : [];

  const pendingItems = [
    ...pdfs
      .filter((item: any) => item.processingStatus !== "ready")
      .map((item: any) => ({
        type: "pdf",
        label: item.originalName || "Document",
        status: item.processingStatus || "pending",
        error: item.lastError || "",
      })),
    ...links
      .filter((item: any) => item.processingStatus !== "ready")
      .map((item: any) => ({
        type: "link",
        label: item.title || item.url || "Website link",
        status: item.processingStatus || "pending",
        error: item.lastError || "",
      })),
    ...youtubeItems
      .filter((item: any) => item.processingStatus !== "ready")
      .map((item: any) => ({
        type: "youtube",
        label: item.title || item.url || item.videoId || "YouTube video",
        status: item.processingStatus || "pending",
        error: item.lastError || "",
      })),
  ];

  return { pdfs, links, youtubeItems, pendingItems };
};

const buildReadySearchFilters = (
  userId: string,
  readyPDFIds: string[],
  readyYoutubeIds: string[],
  readyLinkIds: string[]
) => {
  const base = [{ key: "metadata.userId", match: { value: userId } }];

  return [
    ...readyPDFIds.map((id) => ({
      must: [...base, { key: "metadata.pdfId", match: { value: id } }],
    })),
    ...readyYoutubeIds.map((id) => ({
      must: [...base, { key: "metadata.videoId", match: { value: id } }],
    })),
    ...readyLinkIds.map((id) => ({
      must: [...base, { key: "metadata.linkId", match: { value: id } }],
    })),
  ];
};

router.get("/thread", authMiddleware, async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.userId }).sort({ updatedAt: -1 });
    return res.json(threads);
  } catch {
    return res.status(500).json({ message: "Failed to fetch threads" });
  }
});

router.get("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;
  try {
    const th = await Thread.findOne({ threadId, userId: req.userId });
    if (!th) {
      return res.status(404).json({ message: "ThreadId not found" });
    }
    return res.json(th.messages);
  } catch {
    return res.status(500).json({ message: "Error will accessing threadId" });
  }
});

router.get("/thread/:threadId/context-status", authMiddleware, async (req, res) => {
  try {
    const th = await Thread.findOne({
      threadId: req.params.threadId,
      userId: req.userId,
    });
    if (!th) {
      return res.status(404).json({ message: "ThreadId not found" });
    }

    const { pdfs, links, youtubeItems, pendingItems } = await getAttachmentStatusSummary(
      th,
      req.userId!
    );

    return res.json({
      pendingItems,
      pdfs: pdfs.map((item: any) => ({
        id: item._id.toString(),
        label: item.originalName,
        status: item.processingStatus,
        error: item.lastError || "",
      })),
      links: links.map((item: any) => ({
        id: item._id.toString(),
        label: item.title || item.url,
        href: item.url,
        status: item.processingStatus,
        error: item.lastError || "",
      })),
      youtubeItems: youtubeItems.map((item: any) => ({
        id: item.videoId,
        label: item.title || item.url || item.videoId,
        href: item.url,
        status: item.processingStatus,
        error: item.lastError || "",
      })),
    });
  } catch (error) {
    console.error("Failed to fetch thread context status:", error);
    return res.status(500).json({ message: "Failed to fetch thread context status" });
  }
});

router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;
  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId, userId: req.userId });
    if (!deletedThread) {
      return res.status(404).json({ error: "Thread is not found" });
    }
    return res.status(200).json({ success: "thread is deleted" });
  } catch {
    return res.status(500).json({ e: "Error will deleting the thread" });
  }
});

router.post("/upload/pdf", authMiddleware, requireUpgrade, upload.single("pdf"), async (req, res) => {
  try {
    const userId = req.userId;
    const parsedBody = pdfUploadBodySchema.safeParse(req.body);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid PDF upload payload" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const file = req.file;
    const fileValidation = validateFileUpload(file);
    if (!fileValidation.ok) {
      return res.status(400).json({ error: fileValidation.message });
    }

    const originalName = file.originalname;
    const fileHash = crypto.createHash("sha256").update(file.buffer).digest("hex");

    const cloudUpload = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "pdfs",
          resource_type: "raw",
          use_filename: true,
          unique_filename: true,
          filename_override: originalName,
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );
      stream.end(file.buffer);
    });

    let pdf = await PDFfile.findOne({ userId, fileHash });

    if (pdf) {
      pdf.path = cloudUpload.secure_url;
      pdf.filename = cloudUpload.public_id;
      pdf.originalName = originalName;
      pdf.fileHash = fileHash;
      pdf.mimeType = file.mimetype;
      pdf.sizeBytes = file.size;
      pdf.processingStatus = "pending";
      pdf.lastError = "";
      pdf.embedded = false;
      await pdf.save();
    } else {
      pdf = await PDFfile.create({
        originalName,
        filename: cloudUpload.public_id,
        path: cloudUpload.secure_url,
        fileHash,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        processingStatus: "pending",
        lastError: "",
        embedded: false,
        userId,
      });
    }

    const { threadId, message } = parsedBody.data;
    const th = await ensureThread({
      threadId,
      userId,
      title: message ? await generateTitleFromMessage(message) : "Document Chat",
    });
    th.pdfId = th.pdfId || [];
    if (!th.pdfId.some((id: any) => id.toString() === pdf._id.toString())) {
      th.pdfId.push(pdf._id);
    }
    th.updatedAt = new Date();
    await th.save();

    try {
      await addQueueJob({
        type: "pdf",
        pdfId: pdf._id.toString(),
        userId,
        filename: originalName,
        path: cloudUpload.secure_url,
        fileData: file.buffer.toString("base64"),
      });
    } catch (queueError) {
      console.error("Queue unavailable for PDF upload:", queueError);
      return res.status(503).json({
        error: "Background processing is unavailable. Configure Redis for uploads.",
      });
    }

    return res.json({
      success: true,
      message: "Document uploaded. Processing started.",
      threadId: th.threadId,
      pdfId: pdf._id,
      path: cloudUpload.secure_url,
      filename: originalName,
      processingStatus: pdf.processingStatus,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    if ((err as any)?.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File is too large. Max size is 20MB." });
    }
    return res.status(500).json({ error: "Failed to upload PDF" });
  }
});

router.post("/youtube", authMiddleware, requireUpgrade, async (req, res) => {
  try {
    const parsedBody = youtubeUploadSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ message: "Valid YouTube URL required" });
    }

    const { url, threadId } = parsedBody.data;
    const wrongSection = detectWrongSectionForUrl(url);
    if (wrongSection.expectedType === "file") {
      return res.status(400).json({ message: wrongSection.message });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    let transcript: TranscriptLine[];
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    } catch {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    }

    if (!transcript || transcript.length === 0) {
      return res.status(400).json({
        message: "This video has captions, but transcript could not be extracted",
      });
    }

    const fullText = transcript.map((t) => t.text).join(" ");
    const th = await ensureThread({
      threadId,
      userId: req.userId!,
      title: "YouTube Chat",
    });

    th.youtubeIds = th.youtubeIds || [];
    if (!th.youtubeIds.includes(videoId)) {
      th.youtubeIds.push(videoId);
    }

    th.youtubeItems = th.youtubeItems || [];
    const canonicalUrl = canonicalizeUrl(url);
    const existingItem = th.youtubeItems.find((item: any) => item.videoId === videoId);
    if (existingItem) {
      existingItem.url = canonicalUrl;
      existingItem.contentText = fullText;
      existingItem.processingStatus = "pending";
      existingItem.lastError = "";
    } else {
      th.youtubeItems.push({
        videoId,
        url: canonicalUrl,
        title: `YouTube video ${videoId}`,
        contentText: fullText,
        processingStatus: "pending",
        lastError: "",
      });
    }

    th.updatedAt = new Date();
    await th.save();

    try {
      await addQueueJob({
        type: "youtube",
        videoId,
        text: fullText,
        threadId: th.threadId,
        userId: req.userId,
      });
    } catch (queueError) {
      console.error("Queue unavailable for YouTube upload:", queueError);
      return res.status(503).json({
        message: "Background processing is unavailable. Configure Redis for uploads",
      });
    }

    return res.json({
      success: true,
      threadId: th.threadId,
      processingStatus: "pending",
      message: "YouTube video processing started",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to process YouTube video" });
  }
});

router.post("/upload/link", authMiddleware, requireUpgrade, async (req, res) => {
  try {
    const parsedBody = linkUploadSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Valid website URL required" });
    }

    const { url, threadId, message } = parsedBody.data;
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: "Invalid URL protocol" });
    }

    const wrongSection = detectWrongSectionForUrl(url);
    if (wrongSection.expectedType) {
      return res.status(400).json({ error: wrongSection.message });
    }

    const canonicalUrl = canonicalizeUrl(url);
    const response = await axios.get(canonicalUrl, {
      timeout: 20_000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const contentTypeCheck = classifyFetchedContentType(response.headers["content-type"]);
    if (contentTypeCheck.kind === "wrong-section") {
      return res.status(400).json({ error: contentTypeCheck.message });
    }
    if (contentTypeCheck.kind === "unsupported") {
      return res.status(400).json({ error: contentTypeCheck.message });
    }

    const { title, text } = extractReadableContentFromHtml(response.data);

    if (text.length < 200) {
      return res.status(400).json({
        error: "This page does not expose enough readable text to analyze.",
      });
    }

    let link = await Linkfile.findOne({ userId, canonicalUrl });
    if (link) {
      link.url = canonicalUrl;
      link.canonicalUrl = canonicalUrl;
      link.title = title;
      link.contentText = text;
      link.processingStatus = "pending";
      link.lastError = "";
      link.embedded = false;
      await link.save();
    } else {
      link = await Linkfile.create({
        url: canonicalUrl,
        canonicalUrl,
        title,
        contentText: text,
        processingStatus: "pending",
        lastError: "",
        embedded: false,
        userId,
      });
    }

    const th = await ensureThread({
      threadId,
      userId,
      title: message ? await generateTitleFromMessage(message) : "Link Chat",
    });
    th.linkIds = th.linkIds || [];
    if (!th.linkIds.some((id: any) => id.toString() === link!._id.toString())) {
      th.linkIds.push(link._id);
    }
    th.updatedAt = new Date();
    await th.save();

    try {
      await addQueueJob({
        type: "link",
        text,
        linkId: link._id,
        threadId: th.threadId,
        userId,
      });
    } catch (queueError) {
      console.error("Queue unavailable for link upload:", queueError);
      return res.status(503).json({
        error: "Background processing is unavailable. Configure Redis for uploads",
      });
    }

    return res.json({
      success: true,
      threadId: th.threadId,
      linkId: link._id,
      preview: text.slice(0, 300),
      processingStatus: link.processingStatus,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to process link" });
  }
});

router.get("/pdf/history", authMiddleware, async (req, res) => {
  try {
    const pdfs = await PDFfile.find({ userId: req.userId }).sort({ uploadedAt: -1 });
    return res.json(pdfs);
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    return res.status(500).json({ message: "Error fetching uploaded PDFs" });
  }
});

router.post("/chat1", authMiddleware, async (req, res) => {
  const parsedBody = chatRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let { threadId, message } = parsedBody.data;
  if (!threadId) {
    threadId = Date.now().toString();
  }

  try {
    let th = await Thread.findOne({ threadId, userId: req.userId });
    if (!th) {
      const shortTitle = await generateTitleFromMessage(message);
      th = new Thread({
        userId: req.userId,
        threadId,
        title: shortTitle,
        messages: [{ role: "user", content: message }],
        pdfId: [],
        youtubeIds: [],
        youtubeItems: [],
        linkIds: [],
      });
      await th.save();
    } else {
      th.messages.push({ role: "user", content: message });
      th.updatedAt = new Date();
      await th.save();
    }

    const { pdfs, links, youtubeItems, pendingItems } = await getAttachmentStatusSummary(
      th,
      req.userId!
    );
    const readyPDFIds = pdfs
      .filter((item: any) => item.processingStatus === "ready")
      .map((item: any) => item._id.toString());
    const readyLinkIds = links
      .filter((item: any) => item.processingStatus === "ready")
      .map((item: any) => item._id.toString());
    const readyYoutubeIds = youtubeItems
      .filter((item: any) => item.processingStatus === "ready")
      .map((item: any) => item.videoId);

    let assistantReply = "";

    if (
      (pdfs.length > 0 || links.length > 0 || youtubeItems.length > 0) &&
      readyPDFIds.length === 0 &&
      readyLinkIds.length === 0 &&
      readyYoutubeIds.length === 0
    ) {
      assistantReply = buildProcessingMessage(pendingItems);
    } else if (readyPDFIds.length > 0 || readyLinkIds.length > 0 || readyYoutubeIds.length > 0) {
      try {
        console.log("Context found -> using Gemini with vector search");
        const embeddings = createQueryEmbeddings();
        const qdrantClient = new QdrantClient({
          url: process.env.QDRANT_URL || "http://localhost:6333",
          apiKey: process.env.QDRANT_API_KEY || undefined,
          checkCompatibility: false,
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
          client: qdrantClient,
          collectionName: `user_${req.userId}`,
        });

        const searchFilters = buildReadySearchFilters(
          req.userId!,
          readyPDFIds,
          readyYoutubeIds,
          readyLinkIds
        );

        const searchResultBatches = await Promise.all(
          searchFilters.map((filter) =>
            vectorStore.similaritySearchWithScore(message, 3, filter)
          )
        );

        const deduped = new Map<string, { doc: any; score: number }>();
        for (const batch of searchResultBatches) {
          for (const [doc, score] of batch) {
            const key = `${doc.metadata?.pdfId || ""}:${doc.metadata?.videoId || ""}:${doc.metadata?.linkId || ""}:${doc.pageContent}`;
            const current = deduped.get(key);
            if (!current || score > current.score) {
              deduped.set(key, { doc, score });
            }
          }
        }

        const results = [...deduped.values()]
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map((entry) => entry.doc);

        console.log("Vector search results:", results.length);
        let contextText = results.map((result) => result.pageContent).join("\n\n");

        if (!contextText.trim() && readyLinkIds.length > 0) {
          const linkDocs = await Linkfile.find({
            _id: { $in: readyLinkIds },
            userId: req.userId,
          }).select("title url contentText");

          contextText = linkDocs
            .map((doc: any) =>
              [doc.title, doc.url, (doc.contentText || "").slice(0, 4000)]
                .filter(Boolean)
                .join("\n")
            )
            .join("\n\n");
          console.log("Using stored link text fallback:", linkDocs.length, "links");
        }

        if (!contextText.trim() && readyYoutubeIds.length > 0) {
          contextText = youtubeItems
            .filter((item: any) => readyYoutubeIds.includes(item.videoId))
            .map((item: any) =>
              [item.title, item.url, (item.contentText || "").slice(0, 4000)]
                .filter(Boolean)
                .join("\n")
            )
            .join("\n\n");
        }

        if (!contextText.trim() && pendingItems.length > 0) {
          assistantReply = buildProcessingMessage(pendingItems);
        } else if (!contextText.trim()) {
          assistantReply = await generateOpenAiResponse(message);
        } else {
          const systemPrompt = `
          You are SecondBrain - a personal knowledge assistant.

          Your job is to answer the user's question using the provided context, which may come from:
          - Uploaded PDFs
          - YouTube video transcripts
          - Web links or articles
          - Tweets or social posts
          - Notes saved by the user

          Rules:
          1. Always prioritize the provided context when answering.
          2. If the answer is clearly present in the context, use it directly.
          3. If the context is partially relevant, combine it with your general knowledge.
          4. If the context does not contain the answer at all, answer using general knowledge naturally and confidently.
          5. Never ask the user to resend the link, file, or text if context is already available.
          6. If multiple sources are present, synthesize them into a single clear and complete answer.
          7. Keep responses clear, concise, and helpful.

          Context:
          ${contextText}
        `;

          const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            apiKey: process.env.GEMINI_RAG_KEY || process.env.GEMINI_API_KEY || "",
          });

          const response = await model.invoke([
            ["system", systemPrompt],
            ["human", message],
          ]);

          if (typeof response.content === "string") {
            assistantReply = response.content;
          } else if (Array.isArray(response.content)) {
            assistantReply = response.content
              .map((block) => ("text" in block ? block.text : ""))
              .join("");
          } else {
            assistantReply = "Sorry, I couldn't generate a proper response.";
          }
        }
      } catch (ragError) {
        console.error("RAG flow failed, falling back to base model:", ragError);
        assistantReply = await generateOpenAiResponse(message);
      }
    } else {
      console.log("No ready context -> using standard OpenAI reply");
      assistantReply = await generateOpenAiResponse(message);
    }

    th.messages.push({ role: "assistant", content: assistantReply });
    th.updatedAt = new Date();
    await th.save();

    return res.json({
      reply: assistantReply,
      threadId: th.threadId,
      pendingItems,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error while sending message" });
  }
});

export default router;
