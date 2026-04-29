import { z } from "zod";

export const ProfileSchema = z.object({
  income: z.number().min(0),
  expenses: z.array(z.object({
    category: z.string(),
    amount: z.number().min(0),
    isFixed: z.boolean()
  })),
  savings: z.number().min(0),
  goals: z.array(z.object({
    name: z.string(),
    target: z.number().min(0),
    deadline: z.string().optional()
  })),
  habits: z.array(z.string()).optional()
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(500),
  profile: ProfileSchema.optional(),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).optional()
});

export const ScenarioRequestSchema = z.object({
  profile: ProfileSchema,
  changes: z.object({
    extraSavings: z.number().default(0),
    expenseCuts: z.array(z.string()).optional()
  })
});
