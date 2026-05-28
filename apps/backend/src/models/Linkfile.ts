import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  canonicalUrl: { type: String, default: "" },
  title: String,
  contentText: { type: String, default: "" },
  processingStatus: { type: String, enum: ["pending", "processing", "ready", "failed"], default: "pending" },
  lastError: { type: String, default: "" },
  embedded: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId,  ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Linkfile", LinkSchema);
