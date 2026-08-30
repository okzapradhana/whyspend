import { execFileSync } from "node:child_process";
import { GenericContainer } from "testcontainers";

export default async function globalSetup() {
  process.env.NODE_ENV = "test";

  // Honest migration-backed harness: use committed migrations via `prisma migrate deploy`, fail loudly on missing migration/dependency.
  // Do not swallow with db push or duplicate SQL.
  function migrateDeploy(databaseUrl?: string) {
    execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
      cwd: process.cwd(),
      env: databaseUrl ? { ...process.env, DATABASE_URL: databaseUrl } : process.env,
      stdio: "inherit"
    });
  }

  if (process.env.DATABASE_URL) {
    // Use committed migrations; fail loudly if migration missing or dependency error (do not fall back to db push silently)
    migrateDeploy();
    return;
  }

  try {
    const container = await new GenericContainer("postgres:16-alpine")
      .withEnvironment({
        POSTGRES_DB: "whyspend_test",
        POSTGRES_USER: "whyspend",
        POSTGRES_PASSWORD: "whyspend"
      })
      .withExposedPorts(5432)
      .start();

    const databaseUrl = `postgresql://whyspend:whyspend@${container.getHost()}:${container.getMappedPort(5432)}/whyspend_test?schema=public`;
    process.env.DATABASE_URL = databaseUrl;

    // Deploy committed migrations (includes 20260829000000_household_member_identity view, roles, RLS). Fail loudly on error.
    migrateDeploy(databaseUrl);

    return async () => {
      await container.stop();
    };
  } catch (error) {
    // Only skip when runtime is genuinely unavailable (container could not start). Migration failures must NOT be swallowed.
    const msg = error instanceof Error ? error.message : String(error);
    const isMigrationFailure = /migrate|migration|P3009|P3018|household_member_identity/i.test(msg);
    if (isMigrationFailure) {
      console.error("Migration deploy failed - failing loudly (do not skip):", msg);
      throw error;
    }
    process.env.SKIP_DB_TESTS = "1";
    console.warn("Skipping DB integration tests (runtime unavailable):", msg);
  }
}
