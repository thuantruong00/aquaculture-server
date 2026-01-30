import { z } from "zod";

import { DeviceFieldType, DeviceStatus, DeviceType } from "~/utils/enum";
import { IPV4_REGEX, PagiLimit, PagiOffset } from "~/utils/const";
import { config } from "dotenv";

export const GetListDeviceQuerySchema = z.object({
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

  status: z.enum(DeviceStatus).optional().default(DeviceStatus.ACTIVE),
});

export type IGetListDeviceQueryDTO = z.infer<typeof GetListDeviceQuerySchema>;

const DeviceOrderItemSchema = z.object({
  index: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0),
  ),
  deviceId: z.string().min(1, "deviceId là bắt buộc"),
});

export const UpdateDeviceOrdersSchema = z.object({
  order: z
    .array(DeviceOrderItemSchema)
    .nonempty("Danh sách thiết bị không được rỗng"),
});

export type IDeviceOrderItemDTO = z.infer<typeof DeviceOrderItemSchema>;
export type IUpdateDeviceOrdersDTO = z.infer<typeof UpdateDeviceOrdersSchema>;

const DeviceFieldDefSchema = z.object({
  key: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  valueType: z.enum(DeviceFieldType),
  unit: z.string().min(1).max(32).optional(),
  icon: z.string().min(1).max(128).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  group: z.string().min(1).max(64).optional(),
  deviceType: z.enum(DeviceType),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const CreateDeviceModelSchema = z.object({
  name: z.string().min(1).max(64),
  description: z.string().min(1).max(64).optional(),
  template: z.string().min(1).max(64),
  type: z.array(z.enum(DeviceType)),
  fields: z.array(DeviceFieldDefSchema),
});

export type ICreateDeviceModelDTO = z.infer<typeof CreateDeviceModelSchema>;

export const UpdateDeviceGroupSchema = z.object({
  deviceId: z.string().min(8).max(64),

  groupId: z.string().min(8).max(64),
});

export type IUpdateDeviceGroupDTO = z.infer<typeof UpdateDeviceGroupSchema>;

export const UpdateDeviceSchema = z.object({
  status: z.enum(DeviceStatus).optional(),

  name: z.string().min(1).max(64).optional(),

  description: z.string().max(256).optional(),

  model: z
    .union([z.string().min(1).max(64), z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),

  group: z
    .union([z.string().min(1).max(64), z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),

  zone: z
    .union([z.string().min(1).max(64), z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),

  order: z
    .preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(0),
    )
    .optional(),
});

export type IUpdateDeviceDTO = z.infer<typeof UpdateDeviceSchema>;

export const UpdateDeviceStatusSchema = z.object({
  deviceId: z
    .string()
    .min(8, { message: "deviceId must be at least 8 characters" })
    .max(64, { message: "deviceId must be at most 64 characters" }),

  status: z.enum(DeviceStatus).optional(),
});

export type IUpdateDeviceStatusDTO = z.infer<typeof UpdateDeviceStatusSchema>;

export const ActivateDeviceSchema = z.object({
  deviceId: z
    .string()
    .min(8, { message: "deviceId must be at least 8 characters" })
    .max(64, { message: "deviceId must be at most 64 characters" }),

  deviceName: z
    .string()
    .min(1, { message: "deviceName must not be empty" })
    .max(64, { message: "deviceName must be at most 64 characters" }),
});

export type IActivateDeviceDTO = z.infer<typeof ActivateDeviceSchema>;

export const DeviceConnectSchema = z.object({
  macValue: z.string({
    message: "macValue must be a string",
  }),

  deviceModel: z.string({
    message: "deviceModel must be a string",
  }),

  secretKey: z.string().length(8),
});

export type IDeviceConnectDTO = z.infer<typeof DeviceConnectSchema>;

export const UpdateIpSchema = z.object({
  ip: z.string().regex(IPV4_REGEX, "Invalid IPv4 address"),
  secret: z
    .string()
    .min(8, { message: "deviceId must be at least 8 characters" })
    .max(64, { message: "deviceId must be at most 64 characters" }),
});

export type IUpdateIpDTO = z.infer<typeof UpdateIpSchema>;
