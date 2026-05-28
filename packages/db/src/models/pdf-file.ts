import mongoose, { Schema } from "mongoose";

const PdfSchema = new Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, require: true },
  fileHash: { type: String, default: "" },
  mimeType: { type: String, default: "" },
  sizeBytes: { type: Number, default: 0 },
  processingStatus: {
    type: String,
    enum: ["pending", "processing", "ready", "failed"],
    default: "pending",
  },
  lastError: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  embedded: { type: Boolean, require: true },
});

export const PDFfile =
  mongoose.models.PdfFile || mongoose.model("PdfFile", PdfSchema);
