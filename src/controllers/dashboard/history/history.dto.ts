import z from "zod";
import { PagiLimit, PagiOffset } from "~/utils/const";

export const GetListRecordSchema = z.object({
  deviceId: z
    .string()
    .trim()
    .min(1, { message: "id quá ngắn" })
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),

  key: z
    .string()
    .trim()
    .min(1, { message: "key quá ngắn" })
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),

  date: z
    .string()
    .trim()
    .min(1, { message: "key quá ngắn" })
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),

  offset: z.preprocess(
    (v) => (Array.isArray(v) ? v[0] : v),
    z.coerce.number().int().min(0).max(10000).default(0)
  ),

  limit: z.preprocess(
    (v) => (Array.isArray(v) ? v[0] : v),
    z.coerce.number().int().min(1).max(100).default(50)
  ),
});

export type IGetListRecordDTO = z.infer<typeof GetListRecordSchema>;
