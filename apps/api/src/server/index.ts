import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildServer } from "./routes.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(currentDir, "../../.env") });

const app = buildServer();
const port = Number(process.env.PORT ?? 4174);

app.listen({ host: "127.0.0.1", port }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
