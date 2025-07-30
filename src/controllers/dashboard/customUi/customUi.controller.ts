import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { Device, IDevice } from "~/entities/device.entity";
import {
  DeviceGroupStatus,
  DeviceGroupTemplate,
  DeviceStatus,
  DeviceZone,
} from "~/utils/enum";
import { DeviceGroup } from "~/entities/device-group.entity";
import {
  ICreateDeviceGroupDTO,
  IGetListDeviceGroupQueryDTO,
  IUpdateDeviceGroupInfoDTO,
} from "./customUi.dto";
import { Zone } from "~/entities/zone.entity";
import { Types } from "mongoose";
import { IUpdateDeviceGroupDTO } from "../deviceSetting";
DeviceGroup;

export class CustomUiController extends BaseController {
  handleCustomUiPage = async (req: Request, res: Response) => {
    try {
      const { offset, limit } =
        req.query as unknown as IGetListDeviceGroupQueryDTO;
      const findDeviceGroups = await DeviceGroup.find({
        status: { $ne: DeviceGroupStatus.DELETED },
        level: { $eq: 0 },
      })
        .populate("zone")
        .sort({ order: 1 })
        .skip(offset)
        .limit(limit);

      return this.renderWithSidebar(res, undefined, {
        deviceGroups: findDeviceGroups,
      });
    } catch (error) {
      console.log(error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleDetailDeviceGroupPage = async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params as unknown as any;
      const findGroup = await DeviceGroup.findOne({
        _id: { $eq: groupId },
      }).populate("zone");
      const getDevices = await Device.find({
        group: { _id: groupId },
      })
        .sort({ order: 1 })
        .populate("group")
        .populate("deviceModel");

      const getListOfActiveDevice = await Device.find({
        status: { $eq: DeviceStatus.ACTIVE },
        group: { $in: [null, undefined] },
      })
        .sort({ order: 1 })
        .populate("deviceModel")
        .populate("zone")
        .populate("group");
      const templateDataFromEntries = Object.entries(DeviceGroupTemplate);
      const templateData = [];
      for (const item of templateDataFromEntries) {
        if (item) {
          templateData.push({ label: item[0], value: item[1] });
        }
      }
      return this.renderWithSidebar(res, "page/dashboard/device-group-detail", {
        devices: getDevices,
        activeDevices: getListOfActiveDevice,
        groupId: groupId,
        templateData: templateData,
        currentGroup: findGroup,
      });
    } catch (error) {
      console.log(error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleDeleteDeviceGroupPage = async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params as unknown as any;
      const findGroup = await DeviceGroup.findOne({ _id: { $eq: groupId } });

      if (findGroup) {
        const findDeviceInGroup = await Device.find({
          status: { $eq: DeviceStatus.ACTIVE },
          group: { _id: groupId },
        }).populate("group");
        if (findDeviceInGroup.length < 1) {
          const udpate = await DeviceGroup.updateOne(
            { _id: groupId },
            { status: DeviceGroupStatus.DELETED }
          );
          return res.redirect(req.get("Referer") || "/fallback");
        }
      }
      res.statusCode = 400;
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      console.log(error);
      res.statusCode = 500;
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleDeviceGroupPage = async (req: Request, res: Response) => {
    try {
      const templateDataFromEntries = Object.entries(DeviceGroupTemplate);
      const templateData = [];
      for (const item of templateDataFromEntries) {
        if (item) {
          templateData.push({ label: item[0], value: item[1] });
        }
      }
      return this.renderWithSidebar(res, undefined, {
        templateData: templateData,
      });
    } catch (error) {
      console.log(error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleCreateGroupPage = async (req: Request, res: Response) => {
    try {
      const { groupName, groupDescription, template, zone } =
        req.body as ICreateDeviceGroupDTO;

      const zoneQur = zone ? { id: zone } : { name: DeviceZone.DEFAULT };
      const findZone = await Zone.findOne(zoneQur);
      if (findZone) {
        const create = await DeviceGroup.create({
          name: groupName,
          description: groupDescription,
          template: template,
          zone: { _id: findZone._id },
        });
        if (create) {
          return res.redirect("/custom-ui/device-group");
        }
      }
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      console.log(error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleUpdateGroupInfoPage = async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params as unknown as any;

      const { groupName, groupDescription, template, zoneId, order } =
        req.body as IUpdateDeviceGroupInfoDTO;
      const findGroup = await DeviceGroup.findOne({ _id: { $eq: groupId } });
      if (findGroup) {
        const update = await DeviceGroup.updateOne(
          { _id: { $eq: groupId } },
          {
            name: groupName,
            description: groupDescription,
            template: template,
            order: order,
            zone: { _id: zoneId },
          }
        );
        // return this.renderWithSidebar(res, "page/error");
        if (update) {
          return res.redirect(req.get("Referer") || "/fallback");
        }
      }
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      console.log(error);
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleUpdateGroupPage = async (req: Request, res: Response) => {
    try {
      const { deviceId, groupId } = req.body as IUpdateDeviceGroupDTO;
      const findDevice = await Device.findOne({ _id: deviceId });
      const findGroup = await DeviceGroup.findOne({ _id: groupId });
      console.log("deviceId", deviceId, "findGroup", findGroup);
      if (findDevice && findGroup) {
        const udpate = await Device.updateOne(
          { _id: deviceId },
          { group: { _id: findGroup._id } }
        );
        return res.redirect(req.get("Referer") || "/fallback");
      }
      res.statusCode = 400;
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      console.log(error);
      res.statusCode = 500;
      return this.renderWithSidebar(res, "page/error");
    }
  };
  handleRemoveDevicePage = async (req: Request, res: Response) => {
    try {
      const { deviceId, groupId } = req.body as IUpdateDeviceGroupDTO;
      const findDevice = await Device.findOne({ _id: deviceId });
      const findGroup = await DeviceGroup.findOne({ _id: groupId });
      console.log("deviceId", deviceId, "findGroup", findGroup);
      if (findDevice && findGroup) {
        if (String(findDevice.group?._id) === String(findGroup._id)) {
          await Device.updateOne({ _id: deviceId }, { $set: { group: null } });
        }
        return res.redirect(req.get("Referer") || "/fallback");
      }
      res.statusCode = 400;
      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      console.log(error);
      res.statusCode = 500;
      return this.renderWithSidebar(res, "page/error");
    }
  };

  handleApiCreateGroup = async (req: Request, res: Response) => {
    try {
      const { groupName, groupDescription, template, zone } =
        req.body as ICreateDeviceGroupDTO;

      const zoneQur = zone ? { id: zone } : { name: DeviceZone.DEFAULT };
      const findZone = await Zone.findOne(zoneQur);
      if (findZone) {
        const create = await DeviceGroup.create({
          name: groupName,
          description: groupDescription,
          template: template,
          zone: { _id: findZone._id },
        });
        if (create) {
          return this.handleApiResponse(
            res,
            { payload: create },
            undefined,
            200
          );
        }
      }
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 400);
    } catch (error) {
      console.log(error);
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 500);
    }
  };
  handleApiGetListDeviceGroups = async (req: Request, res: Response) => {
    try {
      const { offset, limit } =
        req.query as unknown as IGetListDeviceGroupQueryDTO;
      const findDeviceGroup = await DeviceGroup.find({
        status: { $ne: DeviceGroupStatus.DELETED },
      })
        .sort({ order: 1 })
        .skip(offset)
        .limit(limit);
      return this.handleApiResponse(
        res,
        { payload: findDeviceGroup },
        undefined,
        200
      );
    } catch (error) {
      console.log(error);
      return this.handleApiResponse(res, { isSuccess: false }, undefined, 500);
    }
  };
}
