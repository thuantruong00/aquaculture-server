import mongoose, { Schema, model, HydratedDocument } from "mongoose";
import { env } from "~/utils";
import { generateZoneKey } from "~/utils/mqtt";

// 1. Interface zone không extends Document
export interface IZone {
  name: string;
  description?: string;
  location?: string;
  mqttZone?: string;
  order: number;
}

// 2. Khai báo schema
const zoneSchema = new Schema<IZone>(
  {
    name: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    mqttZone: { type: String },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// 3. Tự động tăng order nếu chưa được set khi tạo mới
zoneSchema.pre("save", async function (next) {
  if (this.isNew && this.order === 0) {
    const maxZone = await Zone.findOne().sort("-order").select("order").exec();
    this.order = maxZone ? maxZone.order + 1 : 1;
  }
  next();
});

// 4. Tạo mqttZone sau khi zone được tạo
zoneSchema.post("save", async function (doc: HydratedDocument<IZone>) {
  if (!doc.mqttZone) {
    const mqttZone = generateZoneKey(doc._id.toString());
    if (mqttZone) {
      await Zone.findByIdAndUpdate(doc._id, { mqttZone });
      return;
    } else throw new Error("create mqttZone failed");
  }
});

// 5. Tạo model
export const Zone = model<IZone>("Zone", zoneSchema);
