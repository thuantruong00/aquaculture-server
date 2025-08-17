import z from "zod";

export const AddTelegramAccountGroupSchema = z.object({
  accountId: z
    .string()
    .min(8, "deviceId phải có ít nhất 8 ký tự")
    .max(64, "deviceId tối đa 64 ký tự"),

  groupId: z
    .string()
    .min(8, "groupId phải có ít nhất 8 ký tự")
    .max(64, "groupId tối đa 64 ký tự"),
});

export type IAddTelegramAccountGroupSchema = z.infer<
  typeof AddTelegramAccountGroupSchema
>;

export const RemoveTelegramAccountGroupSchema = z.object({
  accountId: z
    .string()
    .min(8, "deviceId phải có ít nhất 8 ký tự")
    .max(64, "deviceId tối đa 64 ký tự"),

  groupId: z
    .string()
    .min(8, "groupId phải có ít nhất 8 ký tự")
    .max(64, "groupId tối đa 64 ký tự"),
});

export type IRemoveTelegramAccountGroupSchema = z.infer<
  typeof RemoveTelegramAccountGroupSchema
>;

export const UpdateGroupSchema = z.object({
  name: z
    .string()
    .min(1, "deviceId phải có ít nhất 8 ký tự")
    .max(64, "deviceId tối đa 64 ký tự"),

  message: z.string().max(64, "Mô tả tối đa 256 ký tự").optional(),
  description: z.string().max(64, "Mô tả tối đa 256 ký tự").optional(),
});

export type IUpdateGroupSchema = z.infer<typeof UpdateGroupSchema>;
