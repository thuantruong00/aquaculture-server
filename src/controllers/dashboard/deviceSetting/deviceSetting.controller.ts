import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { Device, IDevice } from "~/entities/device.entity";
import {
  IActivateDeviceDTO,
  IDeviceConnectDTO,
  IUpdateDeviceDTO,
  IUpdateDeviceGroupDTO,
  IUpdateDeviceOrdersDTO,
  IUpdateDeviceStatusDTO,
} from "./deviceSetting.dto";
import { DeviceSecretKey } from "~/utils/const";
import {
  DeviceFieldType,
  DeviceStatus,
  DeviceType,
  DeviceZone,
} from "~/utils/enum";
import { DeviceModel, IDeviceModel } from "~/entities/device-model.entity";
import { Types } from "mongoose";
import { ObjectId } from "typeorm";
import { Zone } from "~/entities/zone.entity";
import { DeviceGroup, IDeviceGroup } from "~/entities/device-group.entity";

export class DeviceSettingController extends BaseController {
  constructor() {
    super();
  }
  handleDeviceSettingPage = async (req: Request, res: Response) => {
    try {
      return this.renderWithSidebar(res);
    } catch (error) {
      console.log(error);
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
      console.log(error);
      return this.renderWithSidebar(res, "page/error");
    }
  };

  handleApiDeviceConnect = async (req: Request, res: Response) => {
    try {
      const { macValue, secretKey, deviceModel } =
        req.body as IDeviceConnectDTO;
      if (DeviceSecretKey == secretKey) {
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
      return this.handleApiResponse(res, {}, undefined, 400);
    } catch (error) {
      console.log(error);
      return this.handleApiResponse(res, {}, undefined, 500);
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
        return this.handleApiResponse(res, { isSuccess: true }, undefined, 200);
      }
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 400);
    } catch (error) {
      console.log(error);
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 500);
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
        return this.handleApiResponse(res, { isSuccess: true }, undefined, 200);
      }
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 400);
    } catch (error) {
      console.log(error);
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 500);
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
        return this.handleApiResponse(res, { payload: true }, undefined, 200);
      }

      return this.handleApiResponse(res, { isSuccess: false }, undefined, 400);
    } catch (error) {
      console.log(error);
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 500);
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
        return this.handleApiResponse(res, { success: true }, undefined, 200);
      }
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 400);
    } catch (error) {
      console.log(error);
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 500);
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
        return this.handleApiResponse(res, { payload: udpate }, undefined, 200);
      }

      return this.handleApiResponse(res, { isSuccess: false }, undefined, 400);
    } catch (error) {
      console.log(error);
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 500);
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
        return this.handleApiResponse(res, { payload: insert }, undefined, 200);
      }

      return this.handleApiResponse(res, { isSuccess: false }, undefined, 400);
    } catch (error) {
      console.log(error);
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 500);
    }
  };
}
