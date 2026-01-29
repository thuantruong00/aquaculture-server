// models/deviceGroup.model.ts
import { Schema, model, Document, Types } from "mongoose";
import { CssClass, DeviceFieldLayoutStatus, DeviceType } from "~/utils/enum";

export interface IDeviceFieldLayout extends Document {
  name: string;
  description?: string;
  order?: number; // Thứ tự ưu tiên hiển thị
  cssClass?: string;
  template?: string;
  parent?: Types.ObjectId | null; // Nhóm cha (nếu có)
  device: Types.ObjectId;
  fields: Array<String>;
  status?: DeviceFieldLayoutStatus;
  isDisplay: Boolean;
}

const deviceFieldLayoutSchema = new Schema<IDeviceFieldLayout>(
  {
    name: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    cssClass: { type: String, default: CssClass.DEFAULT },
    template: { type: String },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "DeviceGroup",
      default: null,
    },
    device: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      default: null,
    },
    fields: [{ type: String, required: true }],
    status: {
      type: String,
      enum: Object.values(DeviceFieldLayoutStatus),
      default: DeviceFieldLayoutStatus.ACTIVE,
    },
    isDisplay: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const DeviceFieldLayout = model<IDeviceFieldLayout>(
  "DeviceFieldLayout",
  deviceFieldLayoutSchema,
);
