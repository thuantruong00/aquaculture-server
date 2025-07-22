// models/deviceGroup.model.ts
import { Schema, model, Document, Types } from "mongoose";
import {
  CssClass,
  DeviceGroupStatus,
  DeviceGroupTemplate,
  DeviceType,
} from "~/utils/enum";

export interface IDeviceGroup extends Document {
  name: string; // Tên nhóm, ví dụ: "Khu bể lọc", "Sensor nhiệt độ"
  searchName?: string;
  description?: string;
  order?: number; // Thứ tự ưu tiên hiển thị
  cssClass?: string;
  template?: string;
  parent?: Types.ObjectId | null; // Nhóm cha (nếu có)
  level?: number;
  zone: Types.ObjectId | null;
  status?: DeviceGroupStatus;
  isDisplay: Boolean;
}

const deviceGroupSchema = new Schema<IDeviceGroup>(
  {
    name: { type: String, required: true },
    searchName: { type: String, required: false },
    description: { type: String },
    order: { type: Number, default: 0 },
    cssClass: { type: String, default: CssClass.DEFAULT },
    template: { type: String, default: DeviceGroupTemplate.DEFAULT },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "DeviceGroup",
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(DeviceGroupStatus),
      default: DeviceGroupStatus.ACTIVE,
    },
    level: { type: Number, default: 0 },
    zone: {
      type: Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },
    isDisplay: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);
deviceGroupSchema.pre("save", async function (next) {
  if (this.isNew && this.order === 0) {
    const maxZone = await DeviceGroup.findOne()
      .sort("-order")
      .select("order")
      .exec();
    this.order = maxZone && maxZone?.order ? maxZone.order + 1 : 1;
  }
  next();
});
export const DeviceGroup = model<IDeviceGroup>(
  "DeviceGroup",
  deviceGroupSchema
);
