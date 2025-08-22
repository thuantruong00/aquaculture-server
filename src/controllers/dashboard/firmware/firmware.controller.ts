import { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { BaseController } from "../dashboard.base-controller";
import { logger } from "~/utils/logger";

export class FirmwareController extends BaseController {
  handleServeFirmware = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params as { filename: string };

      // 1. Kiểm tra tên file hợp lệ (chỉ cho phép .bin, không có ../)
      const safePattern = /^[a-zA-Z0-9._-]+\.bin$/;
      if (!safePattern.test(filename)) {
        return res.status(400).json({ error: "Invalid filename" });
      }

      // 2. Xác định đường dẫn tuyệt đối
      const filePath = path.resolve(
        __dirname,
        "../../../../data/firmwares",
        filename
      );

      // 3. Đảm bảo filePath vẫn nằm trong thư mục firmwares (ngăn path traversal)
      const firmwaresDir = path.resolve(
        __dirname,
        "../../../../data/firmwares"
      );
      if (!filePath.startsWith(firmwaresDir)) {
        return res.status(400).json({ error: "Access denied" });
      }

      logger.info("Serving firmware file:", filePath);
      console.log("-", __dirname);
      console.log(filePath);
      // Trả file về client
      return res.sendFile(filePath, (err) => {
        if (err) {
          console.error("❌ Error sending file:", err.message);
          res.status(404).send("Firmware not found");
        } else {
          console.log(`✅ Firmware ${filename} served`);
        }
      });

      return this.handleApiResponse(res, { isSuccess: false }, 400);
    } catch (error) {
      logger.error("Err handleApiCreateDeviceModel", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };
}
