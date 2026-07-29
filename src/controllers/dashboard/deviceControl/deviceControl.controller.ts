import { DeviceControlControllerBase } from "./deviceControl.base";
import { Request, Response } from "express";
import { Device } from "~/entities/device.entity";
import {
  DeviceGroupStatus,
  DeviceStatus,
  UserDeviceGroupPermissionAction,
  UserDeviceGroupPermissionStatus,
  UserRole,
} from "~/utils/enum";
import { DeviceGroup, IDeviceGroup } from "~/entities/device-group.entity";
import { IDeviceControlQueryDTO } from "./deviceControl.dto";
import { DeviceRecord } from "~/entities/device-record.entity";
import { ExecutionLog } from "~/entities/execution-log.entity";
import { DeviceFieldConfig } from "~/entities/device-field-config.entity";
import { logger } from "~/utils/logger";
import { UserDeviceGroupPermission } from "~/entities/user-device-group-permission.entity";

DeviceGroup;

export class DeviceControlController extends DeviceControlControllerBase {
  constructor() {
    super();
  }
  async handleDeviceControlPage(req: Request, res: Response) {
    try {
      const { deviceIds, groupIds } =
        req.query as unknown as IDeviceControlQueryDTO;
      const sessionUser = req.session.user;
      const currentRole = sessionUser?.role as UserRole | undefined;
      let allowedGroupIds: string[] | undefined;

      if (currentRole === UserRole.USER && sessionUser?.user_id) {
        const permissions = await UserDeviceGroupPermission.find({
          userId: sessionUser.user_id,
          status: { $eq: UserDeviceGroupPermissionStatus.ACTIVE },
          permissions: { $in: [UserDeviceGroupPermissionAction.VIEW] },
        }).select("deviceGroupId");

        allowedGroupIds = permissions.map((item) => String(item.deviceGroupId));
      }

      const requestedGroupIds = groupIds ?? [];
      const effectiveGroupIds =
        allowedGroupIds === undefined
          ? requestedGroupIds
          : requestedGroupIds.length > 0
            ? requestedGroupIds.filter((id) => allowedGroupIds.includes(String(id)))
            : allowedGroupIds;

      const getGroup = await DeviceGroup.find({
        ...(deviceIds || groupIds || allowedGroupIds !== undefined
          ? { _id: { $in: effectiveGroupIds } }
          : {}),
        status: { $eq: DeviceGroupStatus.ACTIVE },
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
          $sort: { timestamp: -1 },
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
          $sort: { executedAt: -1 }, // Má»›i nháº¥t trÆ°á»›c
        },
        {
          $group: {
            _id: "$deviceId",
            latestRecord: { $first: "$$ROOT" },
          },
        },
      ]);
      const executionLogMap = new Map(
        latestExecutionLog.map((r) => [String(r._id), r]),
      );

      const allDeviceIds = [
        ...getListOfActiveDevice.map((item) => item._id),
        ...getFromDeviceIds.map((item) => item._id),
      ];
      const uniqueDeviceIds = Array.from(
        new Set(allDeviceIds.map((id) => String(id))),
      );
      const fieldConfigs = await DeviceFieldConfig.find({
        device: { $in: uniqueDeviceIds },
      });
      const fieldConfigMap = new Map(
        fieldConfigs.map((cfg) => [String(cfg.device), cfg]),
      );

      const activeDevicesWithField = getListOfActiveDevice.map((item) => ({
        ...item.toObject?.(),
        fieldConfig: fieldConfigMap.get(String(item._id)),
      }));

      const deviceValues = activeDevicesWithField.map((item) => {
        let getRecord = recordMap.get(String(item._id));

        if (!getRecord) {
          getRecord = executionLogMap.get(String(item._id));
        }
        return {
          ...item, // đã convert to object ở activeDevicesWithField
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
        withoutGroupDevice: [],
        deviceByGroup: deviceByGroup,
      });
    } catch (error) {
      logger.error("Err handleDeviceControlPage", error);
      return this.renderWithSidebar(res, "page/error");
    }
  }
}
