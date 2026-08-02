import { z } from "zod";

export const idSchema = z.string().uuid();
export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM");
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
export const amountSchema = z.coerce.number().positive().finite();
export const budgetAmountSchema = z.coerce.number().int().positive().finite();
export const recordTypeSchema = z.enum(["income", "expense", "savings"]);
export const recordScopeSchema = z.enum(["household", "member"]);
export const categoryScopeSchema = z.enum(["household", "member", "both"]);

export const registerSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
  displayName: z.string().trim().min(1).max(80)
});

export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

export const householdCreateSchema = z.object({
  name: z.string().trim().min(1).max(100)
});

export const householdInvitationCreateSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase())
});

export const householdInvitationAcceptSchema = z.object({
  token: z.string().min(10)
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: recordTypeSchema,
  scope: categoryScopeSchema
});

export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  scope: categoryScopeSchema.optional(),
  isArchived: z.boolean().optional()
});

export const transactionCreateSchema = z.object({
  type: recordTypeSchema,
  amount: amountSchema,
  occurredOn: dateSchema,
  categoryId: idSchema,
  ownerUserId: idSchema,
  scope: recordScopeSchema,
  note: z.string().trim().max(500).optional().nullable()
});

export const transactionUpdateSchema = z.object({
  amount: amountSchema.optional(),
  occurredOn: dateSchema.optional(),
  categoryId: idSchema.optional(),
  ownerUserId: idSchema.optional(),
  scope: recordScopeSchema.optional(),
  note: z.string().trim().max(500).optional().nullable()
});

export const categoryBudgetUpsertSchema = z.object({
  month: monthSchema,
  amount: budgetAmountSchema
});

export const categoryBudgetListQuerySchema = z.object({
  month: monthSchema,
  includeInherited: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value !== "false")
});

export const categoryBudgetDeleteQuerySchema = z.object({
  month: monthSchema
});

export const savingsGoalCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  targetAmount: budgetAmountSchema,
  startingAmount: z.coerce.number().int().nonnegative().finite().default(0),
  targetDate: dateSchema.optional().nullable()
});

export const savingsGoalUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  targetAmount: budgetAmountSchema.optional(),
  startingAmount: z.coerce.number().int().nonnegative().finite().optional(),
  targetDate: dateSchema.optional().nullable()
});

export const incomeExpenseHistoryQuerySchema = z.object({
  fromMonth: monthSchema,
  toMonth: monthSchema
});

export function monthFromDate(date: string) {
  return date.slice(0, 7);
}
