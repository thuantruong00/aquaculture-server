// src/repositories/device.repository.ts

import { DeviceGroup, IDeviceGroup } from "~/entities/device-group.entity";

export class DeviceGroupRepository {
  static findById = (id: string): Promise<IDeviceGroup | null> =>
    DeviceGroup.findById(id).exec();

  static findActiveByMac = (macId: string): Promise<IDeviceGroup | null> =>
    DeviceGroup.findOne({ macId, status: "active" }).exec();

  static findByModel = (modelId: string): Promise<IDeviceGroup[]> =>
    DeviceGroup.find({ deviceModel: modelId }).exec();

  static createDeviceGroup = async () => {
    return await DeviceGroup.create({ });
  };
}
