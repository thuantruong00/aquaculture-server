import { DeviceGroup, DeviceStatus, DeviceZone } from "~/utils/enum";

// models/device.model.ts
import { Schema, model, Document, Types } from "mongoose";
import { IZone } from "./zone.entity";
import { IDeviceGroup } from "./device-group.entity";
import { toSearchKey } from "~/utils";

export interface IDevice extends Document {
  group?: Types.ObjectId | null | IDeviceGroup;
  name: string;
  searchKey?: string;
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
    searchKey: { type: String, index: true },
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
  if (this.isModified("name")) {
    this.searchKey = toSearchKey(this.name);
  }
  if (this.isNew && this.order === 0) {
    const maxZone = await Device.findOne()
      .sort("-order")
      .select("order")
      .exec();
    this.order = maxZone ? maxZone.order + 1 : 1;
  }
  next();
});

function attachSearchKeyOnUpdate(this: any, next: Function) {
  const update = this.getUpdate() || {};
  // hỗ trợ cả update trực tiếp và $set
  const newName = update.name ?? update.$set?.name;
  if (typeof newName === "string") {
    const sk = toSearchKey(newName);
    if (update.$set) {
      update.$set.searchKey = sk;
    } else {
      update.searchKey = sk;
    }
    this.setUpdate(update);
  }
  next();
}

deviceSchema.pre("findOneAndUpdate", attachSearchKeyOnUpdate);
deviceSchema.pre("updateOne", attachSearchKeyOnUpdate);
deviceSchema.pre("updateMany", attachSearchKeyOnUpdate);

export const Device = model<IDevice>("Device", deviceSchema);
