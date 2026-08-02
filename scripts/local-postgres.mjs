import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
const pgBin = process.env.PG_BIN ?? "/Library/PostgreSQL/13/bin";
const dataDir = join(root, ".postgres", "data");
const socketDir = join(root, ".postgres");
const logFile = join(root, ".postgres", "postgres.log");
const port = process.env.PGPORT ?? "54329";
const user = process.env.PGUSER ?? "whyspend";
const password = process.env.PGPASSWORD ?? "whyspend";
const database = process.env.PGDATABASE ?? "whyspend";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, PGPASSWORD: password, ...options.env },
    stdio: options.stdio ?? "inherit"
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  return result;
}

function tryRun(command, args) {
  return spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, PGPASSWORD: password },
    stdio: "ignore"
  });
}

function pgTool(name) {
  const path = join(pgBin, name);
  if (!existsSync(path)) {
    console.error(`Missing PostgreSQL tool: ${path}`);
    console.error("Set PG_BIN to a directory containing pg_ctl, initdb, createdb, and pg_isready.");
    process.exit(1);
  }
  return path;
}

function ensureCluster() {
  mkdirSync(socketDir, { recursive: true });
  if (existsSync(dataDir)) {
    return;
  }

  const passwordFile = join(socketDir, "pwfile");
  writeFileSync(passwordFile, `${password}\n`, { mode: 0o600 });
  try {
    run(pgTool("initdb"), [
      "-D",
      dataDir,
      "-U",
      user,
      "--auth-local=trust",
      "--auth-host=md5",
      `--pwfile=${passwordFile}`
    ]);
  } finally {
    rmSync(passwordFile, { force: true });
  }
}

function isRunning() {
  return tryRun(pgTool("pg_isready"), ["-h", "127.0.0.1", "-p", port, "-U", user]).status === 0;
}

function ensureDatabase() {
  const result = spawnSync(pgTool("createdb"), ["-h", "127.0.0.1", "-p", port, "-U", user, database], {
    cwd: root,
    env: { ...process.env, PGPASSWORD: password },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status === 0 || result.stderr.includes("already exists")) {
    return;
  }
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

const command = process.argv[2] ?? "start";

if (command === "start") {
  ensureCluster();
  if (!isRunning()) {
    run(pgTool("pg_ctl"), [
      "-D",
      dataDir,
      "-l",
      logFile,
      "-o",
      `-p ${port} -k ${socketDir}`,
      "start"
    ]);
  }
  ensureDatabase();
  console.log(`PostgreSQL is ready at 127.0.0.1:${port}/${database}`);
} else if (command === "stop") {
  run(pgTool("pg_ctl"), ["-D", dataDir, "stop"]);
} else if (command === "status") {
  run(pgTool("pg_ctl"), ["-D", dataDir, "status"]);
} else {
  console.error("Usage: node scripts/local-postgres.mjs [start|stop|status]");
  process.exit(1);
}
