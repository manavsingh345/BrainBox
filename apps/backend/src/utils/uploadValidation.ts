import { z } from "zod";

const MAX_TEXT_URL_LENGTH = 2048;

export const pdfUploadBodySchema = z.object({
  threadId: z.string().trim().min(1).optional(),
  message: z.string().trim().max(1000).optional(),
});

export const linkUploadSchema = z.object({
  url: z.string().trim().url().max(MAX_TEXT_URL_LENGTH),
  threadId: z.string().trim().min(1).optional(),
  message: z.string().trim().max(1000).optional(),
});

export const youtubeUploadSchema = z.object({
  url: z.string().trim().url().max(MAX_TEXT_URL_LENGTH),
  threadId: z.string().trim().min(1).optional(),
});

export const chatRequestSchema = z.object({
  threadId: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1).max(12000),
});

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

const FILE_EXTENSIONS = [".pdf", ".docx", ".pptx"];

export function canonicalizeUrl(rawUrl: string) {
  const parsed = new URL(rawUrl.trim());
  parsed.hash = "";

  for (const key of [...parsed.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_")) {
      parsed.searchParams.delete(key);
    }
  }

  if ((parsed.protocol === "https:" && parsed.port === "443") || (parsed.protocol === "http:" && parsed.port === "80")) {
    parsed.port = "";
  }

  if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }

  return parsed.toString();
}

export function detectWrongSectionForUrl(rawUrl: string): {
  expectedType: "youtube" | "file" | null;
  message?: string;
} {
  const parsed = new URL(rawUrl);
  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();

  if (YOUTUBE_HOSTS.has(hostname)) {
    return {
      expectedType: "youtube",
      message: "This looks like a YouTube link. Please use the YouTube uploader.",
    };
  }

  const hasFileExtension = FILE_EXTENSIONS.some((extension) => pathname.endsWith(extension));
  if (hasFileExtension) {
    return {
      expectedType: "file",
      message: "This looks like a document file URL. Please use the file uploader instead.",
    };
  }

  return { expectedType: null };
}

export function classifyFetchedContentType(contentTypeHeader: string | undefined) {
  const contentType = (contentTypeHeader || "").toLowerCase();

  if (contentType.includes("text/html") || contentType.includes("application/xhtml+xml")) {
    return { kind: "html" as const };
  }
  if (contentType.includes("pdf") || contentType.includes("officedocument") || contentType.includes("msword") || contentType.includes("presentation")) {
    return {
      kind: "wrong-section" as const,
      message: "This URL points to a document file. Please upload it through the file uploader.",
    };
  }
  if (contentType.startsWith("image/") || contentType.startsWith("video/") || contentType.startsWith("audio/")) {
    return {
      kind: "unsupported" as const,
      message: "This URL points to media, not a readable webpage.",
    };
  }

  return {
    kind: "unsupported" as const,
    message: "This URL does not appear to be a readable webpage.",
  };
}

export function validateFileUpload(file: Express.Multer.File) {
  const allowedMimeTypes = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ]);

  const allowedExtensions = [".pdf", ".docx", ".pptx"];
  const lowerName = file.originalname.toLowerCase();
  const extensionMatches = allowedExtensions.some((extension) => lowerName.endsWith(extension));
  const mimeMatches = allowedMimeTypes.has(file.mimetype);

  if (!extensionMatches || !mimeMatches) {
    return {
      ok: false as const,
      message: "Unsupported file type. Please upload a PDF, DOCX, or PPTX file.",
    };
  }

  return { ok: true as const };
}
