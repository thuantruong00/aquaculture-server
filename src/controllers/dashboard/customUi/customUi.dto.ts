import { PagiLimit, PagiOffset } from "~/utils/const";
import { DeviceGroupStatus } from "~/utils/enum";


import { z } from "zod";

export const CreateDeviceGroupSchema = z.object({
  groupName: z.string().min(1).max(64),

  groupDescription: z
    .union([z.string().min(1).max(64), z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),

  template: z
    .union([z.string().min(1).max(64), z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),

  zone: z
    .union([z.string().min(1).max(64), z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
});

export type ICreateDeviceGroupDTO = z.infer<typeof CreateDeviceGroupSchema>;

export const GetListDeviceGroupQuerySchema = z.object({
  offset: z
    .string()
    .transform((val) => parseInt(val, 0))
    .refine((val) => !isNaN(val), { message: "offset must be a number" })
    .default(PagiOffset)
    .transform(Number), // chuyển lại thành số sau khi mặc định

  limit: z
    .string()
    .transform((val) => parseInt(val, 50))
    .refine((val) => !isNaN(val), { message: "limit must be a number" })
    .default(PagiLimit)
    .transform(Number),

  status: z
    .enum(DeviceGroupStatus)
    .optional()
    .default(DeviceGroupStatus.ACTIVE),
});

export type IGetListDeviceGroupQueryDTO = z.infer<
  typeof GetListDeviceGroupQuerySchema
>;

// Regex để kiểm tra chuỗi không rỗng (nếu cần trim)
const nonEmptyTrimmed = z.string().trim().min(1).max(64);

// Zod schema
export const UpdateDeviceGroupInfoSchema = z.object({
  groupName: z.string().min(1).max(64), // bắt buộc

  groupDescription: z
    .string()
    .trim()
    .min(1, { message: "groupDescription quá ngắn" })
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),

  template: z
    .string()
    .trim()
    .min(1, { message: "template quá ngắn" })
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),

  zoneId: z
    .string()
    .trim()
    .min(1, { message: "zoneId quá ngắn" })
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),

  order: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z
      .number({ message: "Order phải là số" })
      .min(0, "Order tối thiểu là 0")
      .max(30, "Order tối đa là 30")
      .optional()
  ),
});

export type IUpdateDeviceGroupInfoDTO = z.infer<
  typeof UpdateDeviceGroupInfoSchema
>;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdArrayField = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return [];
  return Array.isArray(val) ? val : [val];
}, z.array(z.string().regex(objectIdRegex)));

export const UpdateUserDeviceGroupPermissionBodySchema = z.object({
  userIds: objectIdArrayField,
  viewUserIds: objectIdArrayField.optional().default([]),
  controlUserIds: objectIdArrayField.optional().default([]),
});

export type IUpdateUserDeviceGroupPermissionBodyDTO = z.infer<
  typeof UpdateUserDeviceGroupPermissionBodySchema
>;
