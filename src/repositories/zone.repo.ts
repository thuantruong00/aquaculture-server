// src/repositories/device.repository.ts

import { IZone, Zone } from "~/entities/zone.entity";
import { DeviceZone } from "~/utils/enum";

export class ZoneRepository {
  static findById = (id: string): Promise<IZone | null> =>
    Zone.findById(id).exec();

  static findActiveByMac = (macId: string): Promise<IZone | null> =>
    Zone.findOne({ macId, status: "active" }).exec();

  static findByModel = (modelId: string): Promise<IZone[]> =>
    Zone.find({ deviceModel: modelId }).exec();

  static createDefaultZone = async () => {
    return await Zone.create({ name: DeviceZone.DEFAULT });
  };
}
