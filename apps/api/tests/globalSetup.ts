import { execFileSync } from "node:child_process";
import { GenericContainer } from "testcontainers";

export default async function globalSetup() {
  process.env.NODE_ENV = "test";

  if (process.env.DATABASE_URL) {
    execFileSync("pnpm", ["exec", "prisma", "db", "push", "--skip-generate"], {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit"
    });
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

    execFileSync("pnpm", ["exec", "prisma", "db", "push", "--skip-generate"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl
      },
      stdio: "inherit"
    });

    return async () => {
      await container.stop();
    };
  } catch (error) {
    process.env.SKIP_DB_TESTS = "1";
    console.warn("Skipping DB integration tests:", error instanceof Error ? error.message : String(error));
  }
}
