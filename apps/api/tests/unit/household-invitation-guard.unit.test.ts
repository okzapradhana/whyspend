import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../../prisma/migrations/20260802000000_guard_household_invitation_updates/migration.sql", import.meta.url),
  "utf8"
);

describe("household invitation update guard migration", () => {
  it("installs an invoker trigger for the invitation table", () => {
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.guard_household_invitation_update()");
    expect(migration).toContain("SECURITY INVOKER");
    expect(migration).toContain("DROP TRIGGER IF EXISTS household_invitation_update_guard");
    expect(migration).toContain("CREATE TRIGGER household_invitation_update_guard");
    expect(migration).toContain("BEFORE UPDATE ON public.\"HouseholdInvitation\"");
  });

  it("keeps identity fields immutable for non-owner updates", () => {
    for (const field of ["id", "householdId", "email", "invitedByUserId", "createdAt"]) {
      expect(migration).toContain(`NEW.\"${field}\" IS DISTINCT FROM OLD.\"${field}\"`);
    }
  });

  it("defines separate refresh and acceptance mutation shapes", () => {
    expect(migration).toContain("Invalid household invitation refresh");
    expect(migration).toContain("Invalid household invitation acceptance");
    expect(migration).toContain("OLD.\"expiresAt\" > CURRENT_TIMESTAMP");
    expect(migration).toContain("OLD.\"expiresAt\" <= CURRENT_TIMESTAMP");
    expect(migration).toContain("NEW.\"status\" IS DISTINCT FROM OLD.\"status\"");
    expect(migration).toContain("NEW.\"acceptedByUserId\" IS DISTINCT FROM OLD.\"acceptedByUserId\"");
    expect(migration).toContain("NEW.\"acceptedAt\" IS DISTINCT FROM OLD.\"acceptedAt\"");
    expect(migration).toContain("NEW.\"status\" <> 'accepted'");
    expect(migration).toContain("NEW.\"updatedAt\" IS NOT DISTINCT FROM OLD.\"updatedAt\"");
    expect(migration).toContain("NEW.\"acceptedByUserId\" IS DISTINCT FROM auth.uid()::text");
    expect(migration).toContain("OLD.\"invitedByUserId\" = auth.uid()::text");
  });
});
