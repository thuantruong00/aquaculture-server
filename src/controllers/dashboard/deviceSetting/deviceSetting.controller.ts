import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { Device, IDevice } from "~/entities/device.entity";
import {
  IActivateDeviceDTO,
  IDeviceConnectDTO,
  IGetListDeviceQueryDTO,
  IUpdateDeviceDTO,
  IUpdateDeviceGroupDTO,
  IUpdateDeviceOrdersDTO,
  IUpdateDeviceStatusDTO,
} from "./deviceSetting.dto";
import {
  DeviceFieldType,
  DeviceGroupStatus,
  DeviceStatus,
  DeviceType,
  DeviceZone,
  OtpTarget,
} from "~/utils/enum";
import { DeviceModel, IDeviceModel } from "~/entities/device-model.entity";
import { Types } from "mongoose";
import { ObjectId } from "typeorm";
import { Zone } from "~/entities/zone.entity";
import { DeviceGroup, IDeviceGroup } from "~/entities/device-group.entity";
import { OtpExpireTimeInMs, PagiLimit, PagiOffset } from "~/utils/const";
import { Otp } from "~/entities/otp.entity";
import { randomString } from "~/utils/mqtt";
import { logger } from "~/utils/logger";
export class DeviceSettingController extends BaseController {
  constructor() {
    super();
  }
  handleDeviceSettingPage = async (req: Request, res: Response) => {
    try {
      let { offset, limit, status } =
        req.query as unknown as IGetListDeviceQueryDTO;

      if (!offset || !limit) {
        offset = offset ?? PagiOffset;
        limit = limit ?? PagiLimit;
      }
      if (!status) {
        status = status ?? DeviceStatus.ACTIVE;
      }
      const findDevice = await Device.find({
        status: { $ne: DeviceGroupStatus.DELETED },
      })
        .populate("zone")
        .populate("group")
        .populate("deviceModel")
        .sort({ order: 1 })
        .skip(offset)
        .limit(limit);
      return this.renderWithSidebar(res, undefined, {
        devices: findDevice,
      });
    } catch (error) {
      logger.error("Err handleDeviceSettingPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleDetailDevicePage = async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params as unknown as any;
      const findDevice = await Device.findOne({
        _id: { $eq: deviceId },
      })
        .populate("zone")
        .populate("group")
        .populate("deviceModel");
      const findZone = await Zone.find({});
      const findModel = await DeviceModel.find({});
      if (!findDevice || !findZone || !findModel) {
        return this.renderWithSidebar(res, "page/error");
      }

      return this.renderWithSidebar(res, "page/dashboard/device-detail", {
        device: findDevice,
        deviceStatus: [
          { value: DeviceStatus.ACTIVE, label: "Kích hoạt" },
          { value: DeviceStatus.BANNED, label: "Khoá" },
        ],
        zone: findZone,
        model: findModel,
      });
    } catch (error) {
      logger.error("Err handleDetailDevicePage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleUpdateDevicePage = async (req: Request, res: Response) => {
    try {
      const data = req.body as IUpdateDeviceDTO;
      const { deviceId } = req.params as unknown as any;
      const findDevice = await Device.findOne({ _id: deviceId });
      if (findDevice) {
        const udpate = await Device.updateOne({ _id: deviceId }, { ...data });
        return res.redirect(req.get("Referer") || "/fallback");
      }
      res.statusCode = 400;
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleUpdateDevicePage", error);
      res.statusCode = 500;
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleDeleteDevicePage = async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params as unknown as any;
      const findDevice = await Device.findOne({ _id: { $eq: deviceId } });
      if (findDevice) {
        const update = await Device.updateOne(
          { _id: deviceId },
          { status: DeviceStatus.DELETED }
        );
        return res.redirect("/device-setting");
      }
      res.statusCode = 400;
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleDeleteDevicePage", error);
      res.statusCode = 500;
      return this.renderWithSidebar(res, "page/error");
    }
  };

  handleAddDeviceSettingPage = async (req: Request, res: Response) => {
    try {
      const getListOfInactiveDevice = await Device.find({
        status: { $eq: DeviceStatus.INACTIVE },
      });
      const filter = getListOfInactiveDevice.map((item) => {
        return {
          name: item.name,
          _id: item._id,
          status: item.status,
        };
      });
      return this.renderWithSidebar(res, undefined, {
        listDevice: getListOfInactiveDevice,
      });
    } catch (error) {
      logger.error("Err handleAddDeviceSettingPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleCreatePairingOtpPage = async (req: Request, res: Response) => {
    try {
      const otpCode = randomString(8, { upper: false, lower: false });
      const create = await Otp.create({
        otpCode: otpCode,
        expiresAt: new Date(Date.now() + OtpExpireTimeInMs),
        target: OtpTarget.PAIRING,
      });
      if (create) {
        return this.renderWithSidebar(res, "page/dashboard/create-otp-code", {
          otpCode: otpCode,
        });
      }
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleCreatePairingOtpPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  };

  handleApiDeviceConnect = async (req: Request, res: Response) => {
    try {
      const { macValue, secretKey, deviceModel } =
        req.body as IDeviceConnectDTO;
      const getOtp = await Otp.findOne({ otpCode: secretKey });
      if (getOtp) {
        const isExistedMacId = await Device.find({
          macValue: macValue,
        });
        const findModel = (await DeviceModel.findOne({
          name: deviceModel,
        })) as IDeviceModel;
        const isActiveDevice = isExistedMacId.find(
          (item) => item.status === DeviceStatus.ACTIVE
        );
        const isInactiveDevice = isExistedMacId.filter(
          (item) => item.status === DeviceStatus.INACTIVE || DeviceStatus.BANNED
        );
        if (isActiveDevice) {
          const update = await Device.updateOne(
            { _id: isActiveDevice._id },
            { $set: { isOnline: true } }
          );
          return this.handleApiResponse(res, {
            macValue: macValue,
            deviceId: isActiveDevice._id,
          });
        }
        {
          if (findModel) {
            if (isInactiveDevice.length > 0) {
              const update = await Device.updateMany(
                {
                  deviceModel: { _id: findModel._id },
                  status: { $eq: DeviceStatus.INACTIVE || DeviceStatus.BANNED },
                },
                { $set: { status: DeviceStatus.DELETED, isOnline: false } }
              );
            }
            const data: Partial<IDevice> = {
              name: macValue,
              macValue: macValue,
              status: DeviceStatus.INACTIVE,
              deviceModel: findModel._id as Types.ObjectId,
            };
            const create = await Device.create(data);
            return this.handleApiResponse(res, {
              macValue: macValue,
              deviceId: create._id,
            });
          }
        }
      }
      return this.handleApiResponse(res, {}, 400);
    } catch (error) {
      logger.error("Err handleApiDeviceConnect", error);
      return this.handleApiResponse(res, {}, 500);
    }
  };

  handleApiActivateDevice = async (req: Request, res: Response) => {
    try {
      const { deviceId, deviceName } = req.body as IActivateDeviceDTO;
      const isExistedDeviceId = await Device.findOne({
        _id: deviceId,
      });
      const defaultZone = await Zone.findOne({ name: DeviceZone.DEFAULT });
      if (isExistedDeviceId && defaultZone) {
        const update = await Device.updateOne(
          { _id: isExistedDeviceId._id },
          {
            $set: {
              isOnline: true,
              status: DeviceStatus.ACTIVE,
              zone: defaultZone._id,
              name: deviceName,
            },
          }
        );
        return this.handleApiResponse(res, { isSuccess: true }, 200);
      }
      return this.handleApiResponse(res, { isSuccess: false }, 400);
    } catch (error) {
      logger.error("Err handleApiActivateDevice", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };
  handleApiUpdateDeviceStatus = async (req: Request, res: Response) => {
    try {
      const { deviceId, status } = req.body as IUpdateDeviceStatusDTO;
      const isExistedDeviceId = await Device.findOne({
        _id: deviceId,
      });
      if (isExistedDeviceId) {
        const update = await Device.updateOne(
          { _id: isExistedDeviceId._id },
          {
            $set: {
              status: status,
            },
          }
        );
        return this.handleApiResponse(res, { isSuccess: true }, 200);
      }
      return this.handleApiResponse(res, { isSuccess: false }, 400);
    } catch (error) {
      logger.error("Err handleApiUpdateDeviceStatus", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };
  handleApiUpdateDevice = async (req: Request, res: Response) => {
    try {
      const device = req.body as IUpdateDeviceDTO;
      const { deviceId } = req.params;
      console.log(req.params);
      const findDevice = await Device.findOne({ _id: deviceId });
      if (findDevice) {
        const udpate = await Device.updateOne({ _id: deviceId }, device);
        return this.handleApiResponse(res, { payload: true }, 200);
      }

      return this.handleApiResponse(res, { isSuccess: false }, 400);
    } catch (error) {
      logger.error("Err handleApiUpdateDevice", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };
  handleApiUpdateDeviceOrders = async (req: Request, res: Response) => {
    try {
      const { order } = req.body as IUpdateDeviceOrdersDTO;
      const findDevice = await Device.findOne({
        _id: order[0].deviceId,
      }).populate("group");
      if (findDevice && findDevice.group) {
        const group = findDevice.group as IDeviceGroup;
        const ratio = group.order ?? 1;
        await Device.bulkWrite(
          order.map(({ deviceId, index }) => ({
            updateOne: {
              filter: { _id: deviceId },
              update: { $set: { order: index + ratio * 10 } },
            },
          }))
        );
        return this.handleApiResponse(res, { success: true }, 200);
      }
      return this.handleApiResponse(res, { isSuccess: false }, 400);
    } catch (error) {
      logger.error("Err handleApiUpdateDeviceOrders", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };
  handleApiUpdateGroup = async (req: Request, res: Response) => {
    try {
      const { deviceId, groupId } = req.body as IUpdateDeviceGroupDTO;
      const findDevice = await Device.findOne({ _id: deviceId });
      const findGroup = await DeviceGroup.findOne({ _id: groupId });
      if (findDevice && findGroup) {
        const udpate = await Device.updateOne(
          { _id: deviceId },
          { group: { _id: findGroup._id } }
        );
        return this.handleApiResponse(res, { payload: udpate }, 200);
      }

      return this.handleApiResponse(res, { isSuccess: false }, 400);
    } catch (error) {
      logger.error("Err handleApiUpdateGroup", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };
  handleApiCreateDeviceModel = async (req: Request, res: Response) => {
    try {
      const insert = await DeviceModel.insertOne({
        name: "pump-1",
        description: "pump 1HP 220VAC V1",
        template: "actuator-1",
        type: [DeviceType.ACTUATOR],
        fields: [
          {
            key: "pump",
            label: "Pump",
            valueType: "boolean",
            deviceType: DeviceType.ACTUATOR,
            // unit: undefined,
          },
        ],
      });
      if (insert) {
        return this.handleApiResponse(res, { payload: insert }, 200);
      }

      return this.handleApiResponse(res, { isSuccess: false }, 400);
    } catch (error) {
      logger.error("Err handleApiCreateDeviceModel", error);
      return this.handleApiResponse(res, { isSuccess: false }, 500);
    }
  };


}
