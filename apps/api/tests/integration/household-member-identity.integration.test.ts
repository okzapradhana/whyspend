import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { prisma } from "../../src/db/prisma.js";

const describeDb = process.env.SKIP_DB_TESTS === "1" ? describe.skip : describe;

// No custom view recreation: harness must use committed migration deployed via globalSetup's `prisma migrate deploy`.
// If view missing, fail loudly before any assertions to avoid false positives.

async function hasView(): Promise<boolean> {
  const rows: Array<{ exists: boolean }> = (await prisma.$queryRawUnsafe(
    `SELECT EXISTS (SELECT 1 FROM pg_class WHERE relname='household_member_identity' AND relkind='v') as exists;`
  )) as any;
  return rows[0]?.exists ?? false;
}

describeDb("household_member_identity projection behavioral RLS", () => {
  const migrationPath = resolve(process.cwd(), "prisma/migrations/20260829000000_household_member_identity/migration.sql");

  it("committed migration is deployed and view is security_invoker=false with minimal fields", async () => {
    // Fail loudly if committed migration not deployed (do not recreate with duplicate SQL)
    const viewExists = await hasView();
    if (!viewExists) {
      const hint = `household_member_identity view not found. Ensure globalSetup ran 'prisma migrate deploy' with committed migration at ${migrationPath}.`;
      throw new Error(hint);
    }
    const committedSql = readFileSync(migrationPath, "utf8");
    expect(committedSql).toContain("security_invoker = false");
    expect(committedSql).toContain("household_member_identity");

    const def: Array<{ viewdef: string }> = (await prisma.$queryRawUnsafe(
      `SELECT pg_get_viewdef('public.household_member_identity'::regclass, true) as viewdef;`
    )) as any;
    expect(def[0]?.viewdef).toBeTruthy();
    const viewdef = def[0].viewdef;
    const opts: Array<{ reloptions: string[] | null }> = (await prisma.$queryRawUnsafe(
      `SELECT reloptions FROM pg_class WHERE relname='household_member_identity';`
    )) as any;
    expect(JSON.stringify(opts[0]?.reloptions ?? [])).toContain("security_invoker=false");
    expect(viewdef).toContain("displayName");
    expect(viewdef).not.toMatch(/email/i);
    expect(viewdef).not.toMatch(/password/i);
    expect(viewdef).toContain("get_user_households");

    // Grants must be exactly as committed migration, verified via role_table_grants
    const grants: Array<{ grantee: string; privilege_type: string }> = (await prisma.$queryRawUnsafe(
      `SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='household_member_identity' AND table_schema='public';`
    )) as any;
    expect(grants.find((g) => g.grantee === "authenticated" && g.privilege_type === "SELECT")).toBeTruthy();
    expect(grants.find((g) => g.grantee === "anon" && g.privilege_type === "SELECT")).toBeFalsy();
  });

  it("authenticated sees only own household identities in one pinned transaction with effective role/JWT, anon is denied by grant", async () => {
    const viewExists = await hasView();
    if (!viewExists) throw new Error("view not deployed - cannot test behavioral RLS without committed migration");

    const ownerA = await prisma.user.create({ data: { email: `a-${Date.now()}-${Math.random()}@test.local`, displayName: "OwnerA", password: "x" } });
    const spouseA = await prisma.user.create({ data: { email: `b-${Date.now()}-${Math.random()}@test.local`, displayName: "SpouseA", password: "x" } });
    const ownerB = await prisma.user.create({ data: { email: `c-${Date.now()}-${Math.random()}@test.local`, displayName: "OwnerB", password: "x" } });

    const hhA = await prisma.household.create({ data: { name: "HH-A" } });
    const hhB = await prisma.household.create({ data: { name: "HH-B" } });

    await prisma.householdMember.createMany({
      data: [
        { householdId: hhA.id, userId: ownerA.id, role: "owner" },
        { householdId: hhA.id, userId: spouseA.id, role: "member" },
        { householdId: hhB.id, userId: ownerB.id, role: "owner" },
      ]
    });

    // Pinned authenticated session for ownerA: single transaction/connection with SET ROLE + JWT
    const rowsForA = await prisma.$transaction(async (tx) => {
      // @ts-ignore
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      // @ts-ignore
      await tx.$executeRawUnsafe(`SELECT set_config('request.jwt.claim.sub', '${ownerA.id}', true);`);
      // @ts-ignore
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_user_id', '${ownerA.id}', true);`);
      // @ts-ignore
      const rows: Array<{ householdId: string; userId: string; displayName: string }> = await tx.$queryRawUnsafe(
        `SELECT "householdId", "userId", "displayName" FROM public."household_member_identity" ORDER BY "displayName";`
      );
      return rows;
    });
    const idsForA = rowsForA.map((r) => r.userId);
    expect(idsForA).toContain(ownerA.id);
    expect(idsForA).toContain(spouseA.id);
    expect(idsForA).not.toContain(ownerB.id);
    expect(JSON.stringify(rowsForA)).not.toContain("@test.local");

    // Pinned authenticated session for ownerB
    const rowsForB = await prisma.$transaction(async (tx) => {
      // @ts-ignore
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      // @ts-ignore
      await tx.$executeRawUnsafe(`SELECT set_config('request.jwt.claim.sub', '${ownerB.id}', true);`);
      // @ts-ignore
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_user_id', '${ownerB.id}', true);`);
      // @ts-ignore
      const rows: Array<{ userId: string }> = await tx.$queryRawUnsafe(`SELECT "userId" FROM public."household_member_identity";`);
      return rows;
    });
    expect(rowsForB.map((r) => r.userId)).toEqual([ownerB.id]);

    // Pinned anon session: must prove grant denial, not just zero rows
    let anonError: unknown = null;
    await prisma.$transaction(async (tx) => {
      // @ts-ignore
      await tx.$executeRawUnsafe(`SET LOCAL ROLE anon;`);
      try {
        // @ts-ignore
        await tx.$queryRawUnsafe(`SELECT * FROM public."household_member_identity";`);
      } catch (e) {
        anonError = e;
      }
    });
    expect(anonError, "anon must be denied by REVOKE (not just zero-row filter)").toBeTruthy();
    expect(String((anonError as Error).message)).toMatch(/permission denied|insufficient_privilege/i);
  });
});
