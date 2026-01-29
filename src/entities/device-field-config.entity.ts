import { Schema, model, Document, Types } from "mongoose";

export interface IDeviceFieldConfig extends Document {
  name?: string;
  description?: string;
  device: Types.ObjectId;
  fields: Array<String>;
  data: Record<string, string | number>;
}

const deviceFieldConfigSchema = new Schema<IDeviceFieldConfig>(
  {
    name: { type: String },
    description: { type: String },
    device: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      default: null,
    },
    fields: [{ type: String, required: true }],
    data: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true,
      default: {},
      validate: {
        validator: (val: Map<string, unknown>) => {
          for (const value of val.values()) {
            if (typeof value !== "string" && typeof value !== "number") {
              return false;
            }
          }
          return true;
        },
        message: "data values must be string or number",
      },
    },
  },
  {
    timestamps: true,
  },
);

export const DeviceFieldConfig = model<IDeviceFieldConfig>(
  "DeviceFieldConfig",
  deviceFieldConfigSchema,
);
