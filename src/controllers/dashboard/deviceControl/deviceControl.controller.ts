import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { Device } from "~/entities/device.entity";
import { DeviceStatus, ExecutionSource, ExecutionStatus } from "~/utils/enum";
import { DeviceGroup, IDeviceGroup } from "~/entities/device-group.entity";
import {
  IApiDeviceControlBodyDTO,
  IApiDeviceControlParamsDTO,
  IDeviceControlQueryDTO,
} from "./deviceControl.dto";
import { DeviceRecord } from "~/entities/device-record.entity";
import { ExecutionLog } from "~/entities/execution-log.entity";
import { handlePushLogs, handleWriteCommandSet } from "~/services";
import { logger } from "~/utils/logger";
import { DeviceMessageService } from "~/services/deviceMessage";
import { signDecrypt, signEncrypt } from "~/utils/sign";
import { env } from "~/utils";
DeviceGroup;

export class DeviceControlController extends BaseController {
  private deviceMessageService: DeviceMessageService;
  constructor() {
    super();
    this.deviceMessageService = new DeviceMessageService();
  }
  handleDeviceControlPage = async (req: Request, res: Response) => {
    try {
      const { deviceIds, groupIds } =
        req.query as unknown as IDeviceControlQueryDTO;

      const getGroup = await DeviceGroup.find({
        ...(deviceIds || groupIds ? { _id: { $in: groupIds ?? [] } } : {}),
        status: { $ne: DeviceStatus.DELETED },
      }).sort({ order: 1 });
      const newGroupMap = getGroup.map((item) => item._id);

      const getListOfActiveDevice = await Device.find({
        status: { $eq: DeviceStatus.ACTIVE },
        ...(deviceIds || groupIds ? { group: { $in: newGroupMap ?? [] } } : {}),
      })
        .sort({ order: 1 })
        .populate("deviceModel")
        .populate("zone")
        .populate("group");

      const getFromDeviceIds = await Device.find({
        ...(deviceIds || groupIds ? { _id: { $in: deviceIds } } : {}),
        status: { $eq: DeviceStatus.ACTIVE },
        ...(!deviceIds || groupIds ? { group: null } : {}),
      })
        .sort({ order: 1 })
        .populate("deviceModel")
        .populate("zone")
        .populate("group");
      // ===============
      const deviceIdList = getListOfActiveDevice.map((item) => item._id);
      const latestRecords = await DeviceRecord.aggregate([
        {
          $match: {
            deviceId: { $in: deviceIdList },
          },
        },
        {
          $sort: { timestamp: -1 }, // Mới nhất trước
        },
        {
          $group: {
            _id: "$deviceId",
            latestRecord: { $first: "$$ROOT" },
          },
        },
      ]);
      const recordMap = new Map(latestRecords.map((r) => [String(r._id), r]));

      const latestExecutionLog = await ExecutionLog.aggregate([
        {
          $match: {
            deviceId: { $in: deviceIdList },
          },
        },
        {
          $sort: { executedAt: -1 }, // Mới nhất trước
        },
        {
          $group: {
            _id: "$deviceId",
            latestRecord: { $first: "$$ROOT" },
          },
        },
      ]);
      const executionLogMap = new Map(
        latestExecutionLog.map((r) => [String(r._id), r])
      );

      const deviceValues = getListOfActiveDevice.map((item) => {
        let getRecord = recordMap.get(String(item._id));

        if (!getRecord) {
          getRecord = executionLogMap.get(String(item._id));
        }
        return {
          ...item.toObject?.(), // nếu item là document Mongoose thì nên gọi .toObject()
          latestRecord: getRecord ? getRecord.latestRecord : undefined,
        };
      });
      const deviceByGroup = [];
      for (const group of getGroup) {
        const devices = deviceValues.filter((item) => {
          const groupObj = item.group as IDeviceGroup;
          if (groupObj && String(groupObj._id) === String(group._id)) {
            return item;
          }
        });
        deviceByGroup.push({
          info: { _id: group._id, groupName: group.name },
          template: group.template,
          devices: devices,
        });
      }
      return this.renderWithSidebar(res, undefined, {
        withoutGroupDevice: getFromDeviceIds,
        deviceByGroup: deviceByGroup,
      });
    } catch (error) {
      logger.error("Err handleDeviceControlPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleDeviceControlManagementPage = async (req: Request, res: Response) => {
    try {
      const getListOfActiveDevice = await Device.find({
        status: { $eq: DeviceStatus.ACTIVE },
      })
        .sort({ order: 1 })
        .populate("deviceModel")
        .populate("zone")
        .populate("group");
      const withoutGroupDevice = getListOfActiveDevice.filter(
        (item) => !item.group
      );
      const getGroup = await DeviceGroup.find({
        status: { $ne: DeviceStatus.DELETED },
      }).sort({ order: 1 });
      const deviceByGroup = [];
      for (const group of getGroup) {
        const devices = getListOfActiveDevice.filter((item) => {
          const groupObj = item.group as IDeviceGroup;
          if (groupObj && String(groupObj._id) === String(group._id)) {
            return item;
          }
        });
        deviceByGroup.push({
          info: { _id: group._id, groupName: group.name },
          template: group.template,
          devices: devices,
        });
      }
      return this.renderWithSidebar(res, undefined, {
        withoutGroupDevice: withoutGroupDevice,
        deviceByGroup: deviceByGroup,
      });
    } catch (error) {
      logger.error("Err handleDeviceControlManagementPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };

  handleDeviceTimerPage = async (req: Request, res: Response) => {
    this.renderWithSidebar(res);
  };
  handleAutomaticScenePage = async (req: Request, res: Response) => {
    this.renderWithSidebar(res);
  };

  handleApiControlDevice = async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params as unknown as IApiDeviceControlParamsDTO;
      const { key, value } = req.body as IApiDeviceControlBodyDTO;
      const findDevice = await Device.findOne({ _id: deviceId });
      console.log(deviceId);
      if (findDevice) {
        const insert = await ExecutionLog.create({
          source: ExecutionSource.MANUAL,
          status: ExecutionStatus.SENT,
          deviceId: deviceId,
          values: [
            {
              key: key,
              value: value,
            },
          ],
        });
        await handleWriteCommandSet(String(deviceId), key, Number(value), {
          commandId: String(insert._id),
        });
      }
      return this.handleApiResponse(res, { payload: true }, 200);
    } catch (error) {
      logger.error("Err handleApiControlDevice", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };
  handleApiLogsDevice = async (req: Request, res: Response) => {
    try {
      const { deviceId, log } = req.body as any;
      console.log(req.body);
      if (deviceId && log) {
        await handlePushLogs(deviceId, log);
      }
      return this.handleApiResponse(res, { payload: true }, 200);
    } catch (error) {
      logger.error("Err handleApiControlDevice", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };

  handleApiTelemetry = async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params as any;
      const { sign, value } = req.body as any;
      const now = Number(Date.now() / 1000).toFixed(0);
      const en = signEncrypt(`${env.SECRET_KEY_SIGN}|${now}`);
      console.log(en);
      const deString = signDecrypt(sign);
      const secretKey = deString.split("|")[1];
      const ts = deString.split("|")[0];
      console.log(now, ts, deString);
      if (secretKey == env.SECRET_KEY_SIGN) {
        if (Number(now) - Number(ts) < 30) {
          await this.deviceMessageService.handleTetelemetry(
            "",
            deviceId,
            value
          );
          return this.handleApiResponse(res, { payload: true }, 200);
        }
      }
      return this.handleApiResponse(res, { isSuccess: false }, 400);
    } catch (error) {
      logger.error("Err handleApiControlDevice", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };
}
