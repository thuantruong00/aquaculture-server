// src/database/mongodb.ts
import mongoose from "mongoose";
import { env } from "~/utils/env";

export const connectMongoDB = async () => {
  if (!env.DB_CONNECT_STRING) throw new Error("DB_CONNECT_STRING is empty");

  // Tuỳ chọn: tắt buffer để ném lỗi ngay nếu chưa connect
  mongoose.set("bufferCommands", false);
  mongoose.set("strictQuery", true);

  // Gợi ý: Đừng set dbName ở options nếu bạn đã ghi db trong URI
  // => Đặt dbName trong chính URI là rõ ràng nhất
  try {
    await mongoose.connect(env.DB_CONNECT_STRING, {
      // @ts-ignore
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 20_000,
      family: 4, // ép IPv4 nếu môi trường IPv6 gây trễ
      dbName: "aquadb",
    });

    mongoose.connection.on("connected", () =>
      console.log("✅ Mongo connected:", mongoose.connection.name)
    );
    mongoose.connection.on("error", (e) =>
      console.error("❌ Mongo error:", e?.message || e)
    );
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err; // 🔴 QUAN TRỌNG: ném lỗi để app không tiếp tục chạy
  }
};
