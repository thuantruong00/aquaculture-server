// src/repositories/device.repository.ts
import { IZone, Zone } from "~/entities/zone.entity";
import { env } from "~/utils";
import { DeviceZone } from "~/utils/enum";
import { generateZoneKey } from "~/utils/mqtt";

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
  static updateZonesWithMqttKey = async () => {
    try {
      const zones = await Zone.find({ mqttZone: { $exists: false } });

      if (zones.length === 0) {
        console.log("✅ All zones already have mqttZone set.");
        return;
      }

      for (const zone of zones) {
        const mqttZone = generateZoneKey(zone._id.toString());
        if (mqttZone) {
          zone.mqttZone = mqttZone;
          await zone.save();
          console.log(`✅ Updated zone: ${zone.name} -> ${mqttZone}`);
        }
      }

      console.log("🎉 Done updating all zones.");
      return;
    } catch (error) {
      console.error("❌ Error updating zones:", error);
      return;
    }
  };
}
