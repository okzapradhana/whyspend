import { describe, expect, it } from "vitest";
import { buildServer } from "../../src/server/routes.js";

const describeDb = process.env.SKIP_DB_TESTS === "1" ? describe.skip : describe;

describeDb("auth integration", () => {
  it("registers, logs in, and returns the current user", async () => {
    const app = buildServer();

    const registered = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "owner@example.com",
        password: "password123",
        displayName: "Owner"
      }
    });

    expect(registered.statusCode).toBe(200);
    expect(registered.json().user.displayName).toBe("Owner");

    const loggedIn = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "owner@example.com",
        password: "password123"
      }
    });

    expect(loggedIn.statusCode).toBe(200);

    const me = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: {
        authorization: `Bearer ${loggedIn.json().token}`
      }
    });

    expect(me.statusCode).toBe(200);
    expect(me.json().user.email).toBe("owner@example.com");
    expect(me.json().households).toEqual([]);
  });
});
