import app from "./app";
import { initJobs, mqttClient } from "./services";
import { SocketService } from "./services";
import { connectMongoDB } from "./config/dataSource";
const port = process.env.PORT || 8002;

//test

const main = async () => {
  try {
    connectMongoDB();
    await initJobs(); // ✅ Load các job đã lưu từ file db.json
    console.log("✅ Scheduler initialized");
    mqttClient;

    app.listen(port, () => {
      console.log("🚀 HTTP Server is running on port", port);
    });
  } catch (err) {
    console.error("❌ Error initializing app:", err);
    process.exit(1); // dừng nếu lỗi khởi tạo
  }
};
main();
