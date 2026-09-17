import { z } from "zod";

export const priorities = ["Low", "Medium", "High"] as const;
export const statuses = ["Open", "In Progress", "Completed"] as const;

export const actionSchema = z.object({
  id: z.string(),
  client: z.string().trim().min(1, "Client is required"),
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  owner: z.string().trim().min(1, "Owner is required"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must use YYYY-MM-DD format"),
  priority: z.enum(priorities),
  status: z.enum(statuses)
});

export const createActionSchema = actionSchema.omit({ id: true });

export const updateActionSchema = z
  .object({
    status: z.enum(statuses)
  })
  .strict();

export type Priority = (typeof priorities)[number];
export type Status = (typeof statuses)[number];
export type ActionItem = z.infer<typeof actionSchema>;
export type CreateActionInput = z.infer<typeof createActionSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;
