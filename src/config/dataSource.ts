// src/database/mongodb.ts
import mongoose from "mongoose";
import { env } from "~/utils/env";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(env.DB_CONNECT_STRING, {
      dbName: "aquadb",
    });
    // mongoose.set("debug", function (collectionName, method, query, doc) {
    //   console.log(`[Mongoose] ${collectionName}.${method}`, query, doc);
    // });

    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};
