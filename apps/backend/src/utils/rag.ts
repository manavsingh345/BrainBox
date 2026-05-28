import { TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import type { DocumentInterface } from "@langchain/core/documents";
import * as cheerio from "cheerio";

type EmbeddingTask = "document" | "query";

const resolveEmbeddingEnv = () => ({
  model: process.env.GENAI_EMBEDDING_MODEL || "gemini-embedding-001",
  apiKey:
    process.env.GEMINI_RAG_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "",
});

const createEmbeddingClient = (task: EmbeddingTask) => {
  const { model, apiKey } = resolveEmbeddingEnv();
  const client = new GoogleGenerativeAIEmbeddings({
    model,
    apiKey,
    taskType:
      task === "document"
        ? TaskType.RETRIEVAL_DOCUMENT
        : TaskType.RETRIEVAL_QUERY,
  });
  client.maxBatchSize = 20;
  return client;
};

export const createDocumentEmbeddings = () => createEmbeddingClient("document");

export const createQueryEmbeddings = () => createEmbeddingClient("query");

export const normalizePageText = (value: string) =>
  value
    .replace(/\u0000/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const extractReadableContentFromHtml = (html: string) => {
  const $ = cheerio.load(html);

  $("script, style, noscript, iframe, svg, canvas, template").remove();

  const prioritizedSections = [
    "main",
    "article",
    "[role='main']",
    ".content",
    ".post",
    ".article",
    ".entry-content",
    "body",
  ];

  let bestText = "";
  for (const selector of prioritizedSections) {
    const candidate = normalizePageText($(selector).first().text());
    if (candidate.length > bestText.length) {
      bestText = candidate;
    }
  }

  const title = normalizePageText(
    $('meta[property="og:title"]').attr("content") || $("title").text() || ""
  );
  const description = normalizePageText(
    $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      ""
  );

  return {
    title: title || "Untitled page",
    text: normalizePageText([title, description, bestText].filter(Boolean).join("\n\n")),
  };
};

export const extractReadableTextFromHtml = (html: string) =>
  extractReadableContentFromHtml(html).text;

export async function embedDocumentsSafely(
  documents: DocumentInterface[]
): Promise<{ docs: DocumentInterface[]; vectors: number[][] }> {
  const embeddings = createDocumentEmbeddings();
  const cleanedDocs = documents
    .map((doc) => ({
      ...doc,
      pageContent: normalizePageText(doc.pageContent || ""),
    }))
    .filter((doc) => doc.pageContent.length > 0);

  if (cleanedDocs.length === 0) {
    return { docs: [], vectors: [] };
  }

  const texts = cleanedDocs.map((doc) => doc.pageContent);
  const batchVectors = await embeddings.embedDocuments(texts);
  const docs: DocumentInterface[] = [];
  const vectors: number[][] = [];
  let fallbackCount = 0;

  for (let index = 0; index < cleanedDocs.length; index += 1) {
    let vector = batchVectors[index];

    if (!Array.isArray(vector) || vector.length === 0) {
      fallbackCount += 1;
      try {
        vector = await embeddings.embedQuery(cleanedDocs[index].pageContent);
      } catch (error) {
        console.error("Fallback embedding failed for chunk:", index, error);
        continue;
      }
    }

    if (!Array.isArray(vector) || vector.length === 0) {
      console.warn("Skipping chunk with empty embedding:", index);
      continue;
    }

    docs.push(cleanedDocs[index]);
    vectors.push(vector);
  }

  if (fallbackCount > 0) {
    console.warn(`Recovered ${fallbackCount} empty batch embeddings via per-chunk fallback.`);
  }

  return { docs, vectors };
}
