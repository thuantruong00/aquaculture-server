import { Schema, model, Document, Types } from "mongoose";
import { DeviceFieldAttrKey } from "~/utils/enum";

export type FieldAttrValue = string | number;
export type FieldAttrs = Record<string, FieldAttrValue>;

export interface IDeviceFieldItem {
  key: string;
  attrs: FieldAttrs;
}

export interface IDeviceFieldConfig extends Document {
  name?: string;
  description?: string;
  device: Types.ObjectId;
  fields: IDeviceFieldItem[];
}

const deviceFieldConfigSchema = new Schema<IDeviceFieldConfig>(
  {
    name: { type: String },
    description: { type: String },
    device: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      unique: true,
    },
    fields: [
      {
        key: { type: String, required: true },
        attrs: {
          type: Map,
          of: Schema.Types.Mixed,
          default: {},
          validate: {
            validator: (val: Map<string, unknown>) => {
              const allowedKeys = Object.values(DeviceFieldAttrKey);
              for (const [key, value] of val.entries()) {
                if (!allowedKeys.includes(key as DeviceFieldAttrKey)) {
                  return false;
                }
                if (typeof value !== "string" && typeof value !== "number") {
                  return false;
                }
              }
              return true;
            },
            message:
              "attrs keys must be one of DeviceFieldAttrKey and values must be string or number",
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const DeviceFieldConfig = model<IDeviceFieldConfig>(
  "DeviceFieldConfig",
  deviceFieldConfigSchema,
);
