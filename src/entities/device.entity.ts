import { DeviceGroup, DeviceStatus, DeviceZone } from "~/utils/enum";

// models/device.model.ts
import { Schema, model, Document, Types } from "mongoose";
import { IZone } from "./zone.entity";
import { IDeviceGroup } from "./device-group.entity";

export interface IDevice extends Document {
  group?: Types.ObjectId | null | IDeviceGroup;
  name: string;
  searchName?: string;
  description?: string;
  status?: DeviceStatus;
  isOnline?: boolean;
  createdBy?: string;
  manufactoryInfomation?: string;
  macValue: string;
  updatedBy?: string;
  deviceModel?: Types.ObjectId; // liên kết với DeviceModel
  zone?: Types.ObjectId | null | IZone;
  order: number;
}

const deviceSchema = new Schema<IDevice>(
  {
    name: { type: String, required: true },
    searchName: { type: String, required: false },
    description: { type: String },
    manufactoryInfomation: { type: String },
    macValue: { type: String },
    status: {
      type: String,
      enum: Object.values(DeviceStatus),
      default: DeviceStatus.ACTIVE,
    },
    isOnline: { type: Boolean, default: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deviceModel: {
      type: Schema.Types.ObjectId,
      ref: "DeviceModel",
      required: false,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "DeviceGroup",
      required: false,
      default: null,
    },
    zone: {
      type: Schema.Types.ObjectId,
      ref: "Zone",
      required: false,
      default: null,
    },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

deviceSchema.pre("save", async function (next) {
  if (this.isNew && this.order === 0) {
    const maxZone = await Device.findOne()
      .sort("-order")
      .select("order")
      .exec();
    this.order = maxZone ? maxZone.order + 1 : 1;
  }
  next();
});

export const Device = model<IDevice>("Device", deviceSchema);
