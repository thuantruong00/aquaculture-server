import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { ExecutionLogRepository } from "~/repositories/execution-log.repo";
import { DeviceRecordRepository } from "~/repositories/device-record.repo";
import { Device } from "~/entities/device.entity";
import { DeviceStatus } from "~/utils/enum";
import { IGetListRecordDTO } from "./history.dto";

export class HistoryController extends BaseController {
  handleHistoryPage = async (req: Request, res: Response) => {
    try {
      const { deviceId, key, offset, limit, date } =
        req.query as unknown as IGetListRecordDTO;

      const isDefault = key && deviceId ? false : true;

      const dateValid = String(
        req.query.date || new Date().toISOString().split("T")[0]
      );
      const result = await Device.aggregate([
        {
          $match: {
            status: DeviceStatus.ACTIVE,
          },
        },
        {
          $lookup: {
            from: "devicemodels",
            localField: "deviceModel",
            foreignField: "_id",
            as: "deviceModel",
          },
        },
        { $unwind: "$deviceModel" },
        { $unwind: "$deviceModel.fields" },
        {
          $match: {
            "deviceModel.fields.deviceType": "sensor",
          },
        },
        {
          $project: {
            label: {
              $concat: ["$name", " - ", "$deviceModel.fields.label"],
            },
            source: {
              $literal: "device", // hoặc dùng EnumSource.device nếu đã import
            },
            deviceId: "$_id",
            key: "$deviceModel.fields.key",
            deviceType: "$deviceModel.fields.deviceType",
          },
        },
      ]);
      if (!isDefault) {
        const selectedDevice = await Device.findOne({ _id: deviceId }).populate(
          "deviceModel"
        );
        const qr = await DeviceRecordRepository.getDeviceRecords(
          String(deviceId),
          String(key),
          dateValid,
          offset,
          limit
        );
        return this.renderWithSidebar(res, undefined, {
          deviceId,
          key,
          date: dateValid,
          records: qr.records,
          devices: result,
          selectedDevice,
          offset: qr.offset,
          limit: qr.limit,
          total: Math.ceil(qr.total / limit),
        });
      }
      return this.renderWithSidebar(res, undefined, {
        deviceId: "",
        key: "",
        date: dateValid,
        records: [],
        devices: result,
        offset,
        limit,
        total: 0,
      });
    } catch (err) {
      console.error("renderDeviceChart error:", err);
      return res.status(500).send("Lỗi khi lấy dữ liệu biểu đồ");
    }
  };
  handleHistoryChartPage = async (req: Request, res: Response) => {
    try {
      const deviceId = req.query.deviceId;
      const key = req.query.key;
      const isDefault = key && deviceId ? false : true;

      const date = String(
        req.query.date || new Date().toISOString().split("T")[0]
      );
      const bucket = req.query.bucket ? Number(req.query.bucket) : 15;
      const result = await Device.aggregate([
        {
          $match: {
            status: DeviceStatus.ACTIVE,
          },
        },
        {
          $lookup: {
            from: "devicemodels",
            localField: "deviceModel",
            foreignField: "_id",
            as: "deviceModel",
          },
        },
        { $unwind: "$deviceModel" },
        { $unwind: "$deviceModel.fields" },
        {
          $match: {
            "deviceModel.fields.deviceType": "sensor",
          },
        },
        {
          $project: {
            label: {
              $concat: ["$name", " - ", "$deviceModel.fields.label"],
            },
            source: {
              $literal: "device", // hoặc dùng EnumSource.device nếu đã import
            },
            deviceId: "$_id",
            key: "$deviceModel.fields.key",
            deviceType: "$deviceModel.fields.deviceType",
          },
        },
      ]);
      if (!isDefault) {
        const selectedDevice = await Device.findOne({ _id: deviceId }).populate(
          "deviceModel"
        );
        const qr = await DeviceRecordRepository.getDeviceRecordByDateAndKey(
          String(deviceId),
          String(key),
          date
        );
        const seriesData = qr.map((item) => ({
          x: new Date(item.t).getTime(),
          y: item.value,
        }));

        return this.renderWithSidebar(res, undefined, {
          deviceId,
          key,
          date,
          bucket,
          series: JSON.stringify(seriesData),
          devices: result,
          selectedDevice,
        });
      }
      return this.renderWithSidebar(res, undefined, {
        deviceId: "",
        key: "",
        date,
        bucket,
        series: [],
        devices: result,
      });
    } catch (err) {
      console.error("renderDeviceChart error:", err);
      return res.status(500).send("Lỗi khi lấy dữ liệu biểu đồ");
    }
  };
  handleAverageChartPage = async (req: Request, res: Response) => {
    try {
      const deviceId = req.query.deviceId;
      const key = req.query.key;
      const isDefault = key && deviceId ? false : true;

      const date = String(
        req.query.date || new Date().toISOString().split("T")[0]
      );
      const bucket = req.query.bucket ? Number(req.query.bucket) : 15;
      const result = await Device.aggregate([
        {
          $match: {
            status: DeviceStatus.ACTIVE,
          },
        },
        {
          $lookup: {
            from: "devicemodels",
            localField: "deviceModel",
            foreignField: "_id",
            as: "deviceModel",
          },
        },
        { $unwind: "$deviceModel" },
        { $unwind: "$deviceModel.fields" },
        {
          $match: {
            "deviceModel.fields.deviceType": "sensor",
          },
        },
        {
          $project: {
            label: {
              $concat: ["$name", " - ", "$deviceModel.fields.label"],
            },
            source: {
              $literal: "device", // hoặc dùng EnumSource.device nếu đã import
            },
            deviceId: "$_id",
            key: "$deviceModel.fields.key",
            deviceType: "$deviceModel.fields.deviceType",
          },
        },
      ]);
      if (!isDefault) {
        const selectedDevice = await Device.findOne({ _id: deviceId }).populate(
          "deviceModel"
        );
        const qr = await DeviceRecordRepository.getDeviceRecordTimeSeries(
          String(deviceId),
          String(key),
          date,
          bucket
        );

        return this.renderWithSidebar(res, undefined, {
          deviceId,
          key,
          date,
          bucket,
          seriesAvg: JSON.stringify(qr[2].data),
          seriesMin: JSON.stringify(qr[0].data),
          seriesMax: JSON.stringify(qr[1].data),
          devices: result,
          selectedDevice,
        });
      }
      return this.renderWithSidebar(res, undefined, {
        deviceId: "",
        key: "",
        date,
        bucket,
        seriesAvg: [],
        seriesMin: [],
        seriesMax: [],
        devices: result,
      });
    } catch (err) {
      console.error("renderDeviceChart error:", err);
      return res.status(500).send("Lỗi khi lấy dữ liệu biểu đồ");
    }
  };
}
