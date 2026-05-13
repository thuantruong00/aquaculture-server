import { Request, Response } from "express";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { BaseController } from "../dashboard.base-controller";
import { logger } from "~/utils/logger";
import { Device } from "~/entities/device.entity";
import { handleWriteOtaUpload, handleWriteSettingGet } from "~/services";
import {
  IFirmwareGetInfoDTO,
  IFirmwareOtaUploadDTO,
} from "./firmware.dto";
import { DeviceStatus } from "~/utils/enum";
import { env } from "~/utils";
import { IZone } from "~/entities/zone.entity";

export class FirmwareController extends BaseController {
  handleManageFirmwarePage = async (req: Request, res: Response) => {
    try {
      const firmwareFiles = await getFirmwareFiles();
      return this.renderWithSidebar(res, undefined, { firmwareFiles });
    } catch (error) {
      logger.error("Err handleManageFirmwarePage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleManageFirmwareOTAPage = async (req: Request, res: Response) => {
    try {
      const [firmwareFiles, devices] = await Promise.all([
        getFirmwareFiles(),
        Device.find({
          status: { $in: [DeviceStatus.ACTIVE, DeviceStatus.INACTIVE] },
        })
          .sort({ order: 1, createdAt: -1 })
          .populate("deviceModel")
          .populate("zone")
          .populate("group"),
      ]);

      return this.renderWithSidebar(res, undefined, {
        firmwareFiles,
        devices,
      });
    } catch (error) {
      logger.error("Err handleManageFirmwareOTAPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };

  handleApiGetDeviceInfo = async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.query as IFirmwareGetInfoDTO;
      const findDevice = await Device.findOne({ _id: deviceId });

      if (!findDevice) {
        return this.handleApiResponse(
          res,
          { isSuccess: false, message: "Device not found" },
          404,
        );
      }

      await handleWriteSettingGet(String(deviceId));
      return this.handleApiResponse(res, { isSuccess: true }, 200);
    } catch (error) {
      logger.error("Err handleApiGetDeviceInfo", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };

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
        filename,
      );

      // 3. Đảm bảo filePath vẫn nằm trong thư mục firmwares (ngăn path traversal)
      const firmwaresDir = path.resolve(
        __dirname,
        "../../../../data/firmwares",
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
    } catch (error) {
      logger.error("Err handleApiCreateDeviceModel", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };

  handleDeleteFirmware = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params as { filename: string };
      const filePath = resolveFirmwareFilePath(filename);

      await unlink(filePath);
      return res.redirect("/dashboard/firmware-version");
    } catch (error) {
      logger.error("Err handleDeleteFirmware", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };

  handleUploadFirmware = async (req: Request, res: Response) => {
    try {
      const file = (req as Request & { file?: { filename: string } }).file;
      if (!file) {
        return this.renderWithSidebar(res, "page/error");
      }

      return res.redirect("/dashboard/firmware-version");
    } catch (error) {
      logger.error("Err handleUploadFirmware", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };

  handleApiUploadOta = async (req: Request, res: Response) => {
    try {
      const { targetFile, deviceIds } = req.body as IFirmwareOtaUploadDTO;
      const targetFileUrl = buildOtaFirmwareUrl(targetFile);
      const devices = await Device.find({
        _id: { $in: deviceIds },
      }).populate("zone");

      const otaMessages = [];
      for (const device of devices) {
        const zone = device.zone as unknown as IZone | null;
        if (!zone?.mqttZone) {
          continue;
        }

        const published = await handleWriteOtaUpload(
          zone.mqttZone,
          String(device._id),
          targetFileUrl,
          env.DEVICE_SECRET_KEY,
        );
        otaMessages.push({
          deviceId: String(device._id),
          deviceName: device.name,
          ...published,
        });
      }

      logger.info("OTA upload payload", {
        targetFile,
        targetFileUrl,
        deviceIds,
        otaMessages,
      });

      return this.handleApiResponse(
        res,
        {
          payload: {
            targetFile,
            targetFileUrl,
            deviceIds,
            otaMessages,
          },
        },
        200,
      );
    } catch (error) {
      logger.error("Err handleApiUploadOta", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

const getFirmwareFiles = async () => {
  const firmwaresDir = path.resolve(__dirname, "../../../../data/firmwares");
  const entries = await readdir(firmwaresDir, { withFileTypes: true });
  const firmwareFiles = await Promise.all(
    entries
      .filter(
        (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".bin"),
      )
      .map(async (entry) => {
        const filePath = path.join(firmwaresDir, entry.name);
        const fileStat = await stat(filePath);

        return {
          name: entry.name,
          size: formatFileSize(fileStat.size),
          updatedAt: fileStat.mtime,
          downloadUrl: `/dashboard/firmware/files/${encodeURIComponent(entry.name)}`,
        };
      }),
  );

  firmwareFiles.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return firmwareFiles;
};

const resolveFirmwareFilePath = (filename: string) => {
  const safePattern = /^[a-zA-Z0-9._-]+\.bin$/;
  if (!safePattern.test(filename)) {
    throw new Error("Invalid filename");
  }

  const firmwaresDir = path.resolve(__dirname, "../../../../data/firmwares");
  const filePath = path.resolve(firmwaresDir, filename);

  if (!filePath.startsWith(firmwaresDir)) {
    throw new Error("Access denied");
  }

  return filePath;
};

const buildOtaFirmwareUrl = (filename: string) => {
  const baseUrl = env.OTA_FIRMWARE_PUBLIC_BASE_URL.trim().replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("OTA_FIRMWARE_PUBLIC_BASE_URL is not configured");
  }

  const filePath = resolveFirmwareFilePath(filename);
  void filePath;

  return `${baseUrl}/dashboard/firmware/files/${encodeURIComponent(filename)}`;
};
