import { z } from "zod";

// Regex cho ObjectId 24 ký tự hex
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const DeviceControlQuerySchema = z.object({
  deviceIds: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined; // 👈 trả undefined
      return val.split(",");
    })
    .refine(
      (arr) => arr === undefined || arr.every((id) => objectIdRegex.test(id)),
      {
        message: "Each deviceId must be a valid MongoDB ObjectId",
      }
    ),

  groupIds: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined; // 👈 trả undefined
      return val.split(",");
    })
    .refine(
      (arr) => arr === undefined || arr.every((id) => objectIdRegex.test(id)),
      {
        message: "Each groupId must be a valid MongoDB ObjectId",
      }
    ),
});

export type IDeviceControlQueryDTO = z.infer<typeof DeviceControlQuerySchema>;

export const ApiDeviceControlBodySchema = z.object({
  key: z.string().min(1).max(64),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export type IApiDeviceControlBodyDTO = z.infer<
  typeof ApiDeviceControlBodySchema
>;

export const ApiDeviceControlParamsSchema = z.object({
  deviceId: z.string().min(10).max(64),
});

export type IApiDeviceControlParamsDTO = z.infer<
  typeof ApiDeviceControlParamsSchema
>;
