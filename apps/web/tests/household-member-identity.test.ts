import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migrationPath = resolve(__dirname, "../../../apps/api/prisma/migrations/20260829000000_household_member_identity/migration.sql");
const schemaPath = resolve(__dirname, "../../../apps/api/prisma/schema.sql");

describe("household_member_identity projection privacy boundary", () => {
  it("migration view exposes only householdId, userId, displayName (no email/password/auth)", () => {
    const sql = readFileSync(migrationPath, "utf8");
    // Only allowed columns
    expect(sql).toContain('"householdId"');
    expect(sql).toContain('u.id AS "userId"');
    expect(sql).toContain('u."displayName" AS "displayName"');
    // Must NOT expose private User fields
    expect(sql.toLowerCase()).not.toContain("email");
    expect(sql.toLowerCase()).not.toContain("password");
    expect(sql.toLowerCase()).not.toContain("raw_user_meta_data");
    expect(sql.toLowerCase()).not.toContain("app_metadata");
  });

  it("migration uses security_invoker=false and household isolation via get_user_households()", () => {
    const sql = readFileSync(migrationPath, "utf8");
    expect(sql).toContain("security_invoker = false");
    expect(sql).toContain("public.get_user_households()");
    expect(sql).toContain('WHERE hm."householdId" IN (SELECT public.get_user_households())');
    // Avoid recursive RLS: must use helper, not direct HouseholdMember subquery on itself without definer
    expect(sql).not.toMatch(/FROM\s+"HouseholdMember"\s+WHERE\s+"userId"\s*=\s*auth\.uid\(\)/);
  });

  it("migration grants are household-scoped: authenticated can read, anon blocked, helper granted", () => {
    const sql = readFileSync(migrationPath, "utf8");
    expect(sql).toContain('GRANT SELECT ON public."household_member_identity" TO authenticated');
    expect(sql).toContain('REVOKE ALL ON public."household_member_identity" FROM anon');
    expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.get_user_households() TO authenticated");
    // Must NOT use service_role
    expect(sql.toLowerCase()).not.toContain("service_role");
  });

  it("schema.sql contains the view with same privacy contract", () => {
    const sql = readFileSync(schemaPath, "utf8");
    expect(sql).toContain("household_member_identity");
    expect(sql).toContain("security_invoker = false");
    // Schema view should match migration columns
    const viewSection = sql.slice(sql.indexOf("household_member_identity"));
    expect(viewSection).toContain("displayName");
    expect(viewSection).not.toMatch(/email/);
  });

  it("view is minimal projection: no private User rows broadened (User RLS remains self-only)", () => {
    // Ensure User policy still exists and is not broadened in this migration
    const migration = readFileSync(migrationPath, "utf8");
    // Migration should not alter User policy to allow household reads
    expect(migration).not.toMatch(/CREATE POLICY.*ON "User"/);
    expect(migration).not.toContain("user_self_access");
  });
});
