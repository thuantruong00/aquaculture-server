import { Schema, model, Document } from "mongoose";
import { DeviceFieldType, DeviceType } from "~/utils/enum";

export interface IDeviceModel extends Document {
  name: string;
  description?: string;
  template?: string;
  type: DeviceType[]; // ["sensor", "actuator", "hybrid"]
  fields: IDeviceFieldDef[];
}

export interface IDeviceFieldDef {
  key: string; // "temp", "pump"
  label?: string; // "Nhiệt độ", "Bơm nước"
  valueType: DeviceFieldType; // "integer", "float", "boolean", "string"
  unit?: string; // "°C", "%"
  icon?: string;
  min?: number;
  max?: number;
  group?: string;
  deviceType: DeviceType; // "sensor" | "actuator"
}

const DeviceFieldDefSchema = new Schema<IDeviceFieldDef>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    valueType: {
      type: String,
      enum: Object.values(DeviceFieldType),
      required: true,
    },
    unit: { type: String },
    icon: { type: String },
    min: { type: Number },
    max: { type: Number },
    group: { type: String },
    deviceType: {
      type: String,
      enum: Object.values(DeviceType), // ✅ FIXED
      required: true,
    },
  },
  { _id: false }
);

const DeviceModelSchema = new Schema<IDeviceModel>(
  {
    name: { type: String, required: true },
    description: { type: String },
    template: { type: String },
    type: {
      type: [String],
      enum: Object.values(DeviceType),
      required: true,
    },
    fields: {
      type: [DeviceFieldDefSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DeviceModel = model<IDeviceModel>(
  "DeviceModel",
  DeviceModelSchema
);
