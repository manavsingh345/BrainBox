import mongoose, { model, Schema } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, unique: true },
  clerkId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: String,
  isUpgraded: { type: Boolean, default: false },
  upgradedAt: { type: Date },
  currentPlan: {
    type: String,
    enum: ["Starter", "Pro", "Team"],
    default: "Starter",
  },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly"],
    default: "yearly",
  },
});

const ContentSchema = new Schema({
  title: String,
  link: String,
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  type: String,
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});

const LinksSchema = new Schema({
  hash: String,
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true },
});

export const LinkModel = mongoose.models.Links || model("Links", LinksSchema);
export const UserModel = mongoose.models.User || model("User", UserSchema);
export const ContentModel = mongoose.models.Content || model("Content", ContentSchema);
