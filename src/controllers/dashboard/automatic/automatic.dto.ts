import z from "zod";
import { ActionStatus, LogicOperator, SceneStatus } from "~/utils/enum";
const ensureArray = (val: unknown) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return [val];
  return [];
};

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
    .min(1, { message: "actionId quá ngắn" })
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),

  device: z.preprocess(ensureArray, z.array(z.string().min(1).max(300))),
  operator: z.preprocess(ensureArray, z.array(z.string().min(1).max(64))),
  value: z.preprocess(ensureArray, z.array(z.string().min(1).max(64))),
});

export type IAutomaticSceneSaveBodySchema = z.infer<
  typeof AutomaticSceneSaveBodySchema
>;

export const AutomaticSceneUpdateBodySchema = z.object({
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
    .min(1, { message: "actionId quá ngắn" })
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),

  device: z.preprocess(ensureArray, z.array(z.string().min(1).max(300))),
  operator: z.preprocess(ensureArray, z.array(z.string().min(1).max(64))),
  value: z.preprocess(ensureArray, z.array(z.string().min(1).max(64))),
});

export type IAutomaticSceneUpdateBodySchema = z.infer<
  typeof AutomaticSceneUpdateBodySchema
>;


export const ActionUpdateBodySchema = z.object({
  name: z.string().min(1).max(64),
  status: z.enum(ActionStatus),
  description: z.string().min(1).max(300),
  device: z.preprocess(ensureArray, z.array(z.string().min(1).max(300))),
  value: z.preprocess(ensureArray, z.array(z.string().min(1).max(64))),
});

export type IActionUpdateBodySchema = z.infer<typeof ActionUpdateBodySchema>;
