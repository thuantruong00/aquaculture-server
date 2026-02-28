import app from "./app";
import "./entities";
import { SocketService } from "./services";
import { connectMongoDB } from "./config/dataSource";
import { initialService } from "./services/initial/initial.service";
const port = process.env.PORT || 8002;

//test

const main = async () => {
  try {
    await connectMongoDB();
    console.log("✅ Scheduler initialized");

    await initialService(); // ✅ Gọi init sau khi đã connect
    app.listen(port, () => {
      console.log("🚀 HTTP Server is running on port", port);
    });
  } catch (err) {
    console.error("❌ Error initializing app:", err);
    process.exit(1); // dừng nếu lỗi khởi tạo
  }
};
main();
