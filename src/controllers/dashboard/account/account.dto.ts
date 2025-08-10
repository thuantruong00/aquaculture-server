import z from "zod";
import { UserRole, UserStatus } from "~/utils/enum";

export const ActionCreateAccountBodySchema = z.object({
  userName: z.string().min(4).max(64),
  nickName: z
    .string()
    .min(1, "Ít nhất 3 ký tự")
    .max(32, "Tối đa 20 ký tự")
    .or(z.literal("")) // cho phép chuỗi rỗng
    .optional(),
  status: z.enum(UserStatus),
  role: z.enum(UserRole),
  password: z.string().min(6).max(32),
  rePassword: z.string().min(6).max(32),
});

export type IActionCreateAccountBodySchema = z.infer<
  typeof ActionCreateAccountBodySchema
>;
