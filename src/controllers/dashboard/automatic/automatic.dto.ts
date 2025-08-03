import z from "zod";
import {
  ActionStatus,
  LogicOperator,
  RepeatUnit,
  SceneStatus,
  TimerStatus,
} from "~/utils/enum";
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

export const TimerCreateBodySchema = z.object({
  name: z.string().min(1).max(64),
  action: z.string().min(1).max(64),
  status: z.enum(TimerStatus).default(TimerStatus.ACTIVE),
  description: z.string().min(1).max(300).optional(),
  isRepeating: z
    .preprocess((val) => {
      if (val === undefined || val === null) return false;
      if (val === "1" || val === 1 || val === true) return true;
      return false;
    }, z.boolean())
    .default(false),
  runHour: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 23, {
      message: "runHour must be between 0 and 23",
    }),

  runMinute: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 59, {
      message: "runMinutes must be between 0 and 59",
    }),

  repeatInterval: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return 1;
      return Number(val);
    }),

  repeatUnit: z
    .union([z.enum(RepeatUnit), z.string()])
    .transform((val) => val as RepeatUnit),
});

export type ITimerCreateBodySchema = z.infer<typeof TimerCreateBodySchema>;
