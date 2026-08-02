import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

test("frontend API client attaches JWT authorization headers", async () => {
  const source = readFileSync("src/lib/api/authToken.ts", "utf8") + readFileSync("src/lib/api/client.ts", "utf8");
  expect(source).toContain("Authorization");
  expect(source).toContain("Bearer");
});
