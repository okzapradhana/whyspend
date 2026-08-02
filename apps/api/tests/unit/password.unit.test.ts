import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../src/modules/auth/password.js";

describe("password helpers", () => {
  it("hashes and verifies a password", async () => {
    const password = "password123";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
