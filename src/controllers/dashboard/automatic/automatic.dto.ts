import z from "zod";
import { LogicOperator, SceneStatus } from "~/utils/enum";

export const AutomaticSceneSaveBodySchema = z.object({
  name: z.string().min(1).max(64),
  status: z.enum(SceneStatus).optional().default(SceneStatus.ACTIVE),
  group: z
    .string()
    .trim()
    .min(1, { message: "groupDescription quá ngắn" })
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),

  logic: z.enum(LogicOperator).optional().default(LogicOperator.AND),
  action: z
    .string()
    .trim()
    .min(1, { message: "zoneId quá ngắn" })
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),

  device: z.array(z.string().min(1).max(300)),
  operator: z.array(z.string().min(1).max(64)),
  value: z.array(z.string().min(1).max(64)),
});

export type IAutomaticSceneSaveBodySchema = z.infer<
  typeof AutomaticSceneSaveBodySchema
>;
