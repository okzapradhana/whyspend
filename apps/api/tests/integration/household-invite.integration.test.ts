import { describe, expect, it } from "vitest";
import { buildServer } from "../../src/server/routes.js";
import { createSession } from "../setup.js";

const describeDb = process.env.SKIP_DB_TESTS === "1" ? describe.skip : describe;

describeDb("household invitations", () => {
  it("creates and accepts a spouse invitation", async () => {
    const app = buildServer();
    const owner = await createSession(app);
    const auth = { authorization: `Bearer ${owner.token}` };

    const invite = await app.inject({
      method: "POST",
      url: `/api/households/${owner.household.id}/invitations`,
      headers: auth,
      payload: { email: "spouse@example.com" }
    });

    expect(invite.statusCode).toBe(200);
    expect(invite.json().inviteUrl).toContain("/invite/");

    const spouseRegister = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "spouse@example.com",
        password: "password123",
        displayName: "Spouse"
      }
    });

    const accepted = await app.inject({
      method: "POST",
      url: "/api/households/invitations/accept",
      headers: {
        authorization: `Bearer ${spouseRegister.json().token}`
      },
      payload: {
        token: invite.json().token
      }
    });

    expect(accepted.statusCode).toBe(200);

    const household = await app.inject({
      method: "GET",
      url: `/api/households/${owner.household.id}`,
      headers: auth
    });

    expect(household.statusCode).toBe(200);
    expect(household.json().members).toHaveLength(2);
  });
});
