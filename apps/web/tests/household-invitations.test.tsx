import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InviteAcceptancePage } from "../src/app/router";
import { refreshHouseholdInvitation } from "../src/lib/api/households";

const supabaseMock = vi.hoisted(() => ({
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn()
}));

vi.mock("../src/lib/supabaseClient", () => ({ supabase: supabaseMock }));

const authState = vi.hoisted(() => ({
  user: { id: "user-1", displayName: "Invited User", email: "invitee@example.com" } as { id: string; displayName: string; email: string } | null,
  refresh: vi.fn()
}));

vi.mock("../src/app/authState", () => ({
  useAuth: () => authState
}));

function createQuery(result: { data: unknown; error: unknown }, onUpdate?: (payload: unknown) => void) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    is: vi.fn(() => query),
    update: vi.fn((payload: unknown) => {
      onUpdate?.(payload);
      return query;
    }),
    single: vi.fn(async () => result),
    maybeSingle: vi.fn(async () => result)
  };
  return query;
}

const expiredInvitation = {
  id: "invitation-1",
  householdId: "household-1",
  email: "invitee@example.com",
  token: "expired-token",
  status: "pending",
  invitedByUserId: "owner-1",
  acceptedByUserId: null,
  expiresAt: "2026-08-01T00:00:00.000Z",
  acceptedAt: null,
  createdAt: "2026-07-25T00:00:00.000Z",
  updatedAt: "2026-07-25T00:00:00.000Z"
};

function renderInvite() {
  return render(
    <MemoryRouter initialEntries={["/invite/expired-token"]}>
      <Routes>
        <Route path="/invite/:token" element={<InviteAcceptancePage />} />
        <Route path="/dashboard" element={<main>Dashboard</main>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("expired household invitations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { id: "user-1", displayName: "Invited User", email: "invitee@example.com" };
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: authState.user }, error: null });
  });

  it("shows the expired state and offers refresh to the signed-in invited user", async () => {
    const api = await import("../src/lib/api/households");
    vi.spyOn(api, "acceptHouseholdInvitation").mockRejectedValueOnce(new api.HouseholdInvitationExpiredError());
    vi.spyOn(api, "refreshHouseholdInvitation").mockResolvedValue({
      ...expiredInvitation,
      token: "fresh-token",
      expiresAt: "2026-08-09T00:00:00.000Z",
      updatedAt: "2026-08-02T00:00:00.000Z"
    });

    renderInvite();

    expect(await screen.findByText("This invitation has expired.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh invitation" })).toBeInTheDocument();
  });

  it("does not offer refresh or accept while unauthenticated", async () => {
    authState.user = null;

    renderInvite();

    expect(await screen.findByText(/sign in or create an account/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Refresh invitation" })).not.toBeInTheDocument();
  });

  it("refreshes successfully and follows the new invitation token", async () => {
    const api = await import("../src/lib/api/households");
    vi.spyOn(api, "acceptHouseholdInvitation")
      .mockRejectedValueOnce(new api.HouseholdInvitationExpiredError())
      .mockResolvedValueOnce({ household: { id: "household-1", name: "Home" } });
    const refreshSpy = vi.spyOn(api, "refreshHouseholdInvitation").mockResolvedValue({
      ...expiredInvitation,
      token: "fresh-token",
      expiresAt: "2026-08-09T00:00:00.000Z",
      updatedAt: "2026-08-02T00:00:00.000Z"
    });

    renderInvite();
    await userEvent.click(await screen.findByRole("button", { name: "Refresh invitation" }));

    expect(refreshSpy).toHaveBeenCalledWith("expired-token");
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(api.acceptHouseholdInvitation).toHaveBeenLastCalledWith("fresh-token");
  });
});

describe("refreshHouseholdInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "invitee@example.com" } },
      error: null
    });
  });

  it("rejects unauthenticated refreshes before reading the invitation", async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(refreshHouseholdInvitation("expired-token")).rejects.toThrow("Unauthenticated");
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("rejects an email mismatch without updating the invitation", async () => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-2", email: "other@example.com" } },
      error: null
    });
    supabaseMock.from.mockReturnValueOnce(createQuery({ data: expiredInvitation, error: null }));

    await expect(refreshHouseholdInvitation("expired-token")).rejects.toThrow(/invited email/i);
    expect(supabaseMock.from).toHaveBeenCalledTimes(1);
  });

  it("uses a fresh token and seven-day expiry without mutating protected fields", async () => {
    const payloads: unknown[] = [];
    const refreshedInvitation = {
      ...expiredInvitation,
      token: "fresh-token",
      expiresAt: "2026-08-09T00:00:00.000Z",
      updatedAt: "2026-08-02T00:00:00.000Z"
    };
    supabaseMock.from
      .mockReturnValueOnce(createQuery({ data: expiredInvitation, error: null }))
      .mockReturnValueOnce(createQuery({ data: refreshedInvitation, error: null }, (payload) => payloads.push(payload)));

    const result = await refreshHouseholdInvitation("expired-token");

    expect(result.token).toBe("fresh-token");
    expect(result.inviteUrl).toBe(`${window.location.origin}/invite/fresh-token`);
    const payload = payloads[0] as { token: string; expiresAt: string; updatedAt: string };
    expect(payload).toEqual({ token: expect.any(String), expiresAt: expect.any(String), updatedAt: expect.any(String) });
    expect(payload.token).not.toBe(expiredInvitation.token);
    expect(payload.token).toMatch(/^[0-9a-f]{48}$/);
    expect(Math.abs(new Date(payload.expiresAt).getTime() - Date.now() - 7 * 24 * 60 * 60 * 1000)).toBeLessThan(2_000);
    expect(payloads[0]).not.toHaveProperty("householdId");
    expect(payloads[0]).not.toHaveProperty("email");
    expect(payloads[0]).not.toHaveProperty("invitedByUserId");
    expect(payloads[0]).not.toHaveProperty("status");
    expect(payloads[0]).not.toHaveProperty("acceptedByUserId");
    expect(payloads[0]).not.toHaveProperty("acceptedAt");
  });
});
