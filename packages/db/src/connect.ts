import mongoose from "mongoose";

export async function connectToDatabase(mongoUrl: string) {
  if (!mongoUrl) {
    throw new Error("MONGO_URL is not configured.");
  }

  if (mongoose.connection.readyState !== 0) {
    return mongoose.connection;
  }

  await mongoose.connect(mongoUrl);
  return mongoose.connection;
}
