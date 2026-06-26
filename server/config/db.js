import dns from "dns";
import mongoose from "mongoose";
import { loadFileStore, setStorageMode } from "../utils/dataStore.js";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (error) {
  console.warn(`Unable to override DNS servers: ${error.message}`);
}

export const connectDB = async () => {
  const mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();

  if (!mongoUri) {
    setStorageMode("file");
    await loadFileStore();
    console.warn("MONGO_URI is empty. Task Manager and Productivity Dashboard is using local file storage.");
    return "file";
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      family: 4,
      retryWrites: true,
      w: "majority"
    });
    setStorageMode("mongo");
    console.log("MongoDB connected");
    return "mongo";
  } catch (error) {
    setStorageMode("file");
    await loadFileStore();
    console.warn(`MongoDB connection failed: ${error.message}`);
    console.warn("Task Manager and Productivity Dashboard is using local file storage.");
    return "file";
  }
};
