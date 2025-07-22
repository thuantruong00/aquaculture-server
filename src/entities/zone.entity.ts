// models/zone.model.ts
import { Schema, model, Document } from "mongoose";

export interface IZone extends Document {
  name: string;
  description?: string;
  location?: string;
  order: number;
}

const zoneSchema = new Schema<IZone>(
  {
    name: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

zoneSchema.pre("save", async function (next) {
  if (this.isNew && this.order === 0) {
    const maxZone = await Zone.findOne().sort("-order").select("order").exec();
    this.order = maxZone ? maxZone.order + 1 : 1;
  }
  next();
});

export const Zone = model<IZone>("Zone", zoneSchema);
