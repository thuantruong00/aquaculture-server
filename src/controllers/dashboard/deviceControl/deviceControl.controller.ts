import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { Device } from "~/entities/device.entity";
import { DeviceStatus } from "~/utils/enum";
import { DeviceGroup, IDeviceGroup } from "~/entities/device-group.entity";
DeviceGroup;

export class DeviceControlController extends BaseController {
  handleDeviceControlPage = async (req: Request, res: Response) => {
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
          groupName: group.name,
          template: group.template,
          devices: devices,
        });
      }
      return this.renderWithSidebar(res, undefined, {
        withoutGroupDevice: withoutGroupDevice,
        deviceByGroup: deviceByGroup,
      });
    } catch (error) {
      console.log(error);
      return this.renderWithSidebar(res, "page/error");
    }
  };

  handleDeviceTimer = async (req: Request, res: Response) => {
    this.renderWithSidebar(res);
  };
}
