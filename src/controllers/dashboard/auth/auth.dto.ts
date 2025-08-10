import z from "zod";

export const ActionSignInBodySchema = z.object({
  userName: z.string().min(1).max(64),
  password: z.string().min(4).max(32),
});

export type IActionSignInBodySchema = z.infer<typeof ActionSignInBodySchema>;
