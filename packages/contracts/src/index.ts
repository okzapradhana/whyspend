import { z } from "zod";

export const recordTypeSchema = z.enum(["income", "expense", "savings"]);
export const recordScopeSchema = z.enum(["household", "member"]);
export const categoryScopeSchema = z.enum(["household", "member", "both"]);

export type RecordType = z.infer<typeof recordTypeSchema>;
export type RecordScope = z.infer<typeof recordScopeSchema>;
export type CategoryScope = z.infer<typeof categoryScopeSchema>;

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
}

export interface HouseholdRef {
  id: string;
  name: string;
  role?: "owner" | "member";
}

export interface SavingsGoalContract {
  id: string;
  householdId: string;
  categoryId: string;
  name: string;
  targetAmount: number;
  startingAmount: number;
  savedAmount: number;
  targetDate: string | null;
}
