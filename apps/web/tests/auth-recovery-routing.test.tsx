import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthOnlyRoute, ProtectedRoute, RecoveryRouteGuard } from "../src/app/router";

const authState = vi.hoisted(() => ({
  user: { id: "user-1", displayName: "Okza", email: "okza@example.com" } as { id: string; displayName: string; email: string } | null,
  activeHousehold: { id: "household-1", name: "Home", role: "owner" } as { id: string; name: string; role: string } | null,
  isPasswordRecovery: true,
  loading: false
}));

vi.mock("../src/app/authState", () => ({
  useAuth: () => authState
}));

function renderProtectedRoute(route = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<main>Dashboard</main>} />
        </Route>
        <Route path="/update-password" element={<main>Update password</main>} />
      </Routes>
    </MemoryRouter>
  );
}

function renderAuthOnlyRoute(route = "/auth") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route element={<AuthOnlyRoute />}>
          <Route path="/auth" element={<main>Sign in</main>} />
        </Route>
        <Route path="/update-password" element={<main>Update password</main>} />
      </Routes>
    </MemoryRouter>
  );
}

function renderRecoveryRoute(route: string, path: string, child: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route element={<RecoveryRouteGuard />}>
          <Route path={path} element={child} />
        </Route>
        <Route path="/update-password" element={<main>Update password</main>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("password recovery routing", () => {
  beforeEach(() => {
    authState.user = { id: "user-1", displayName: "Okza", email: "okza@example.com" };
    authState.activeHousehold = { id: "household-1", name: "Home", role: "owner" };
    authState.isPasswordRecovery = true;
    authState.loading = false;
  });

  it("blocks recovery sessions from protected financial routes", async () => {
    renderProtectedRoute();

    expect(await screen.findByText("Update password")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("keeps the public update route reachable from the auth-only route", async () => {
    renderAuthOnlyRoute();

    expect(await screen.findByText("Update password")).toBeInTheDocument();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });

  it("preserves the normal unauthenticated login flow", async () => {
    authState.user = null;
    authState.activeHousehold = null;
    authState.isPasswordRecovery = false;

    renderAuthOnlyRoute();

    expect(await screen.findByText("Sign in")).toBeInTheDocument();
    expect(screen.queryByText("Update password")).not.toBeInTheDocument();
  });

  it("blocks recovery sessions from household setup before it can render or mutate", async () => {
    const mutate = vi.fn();

    renderRecoveryRoute(
      "/household-setup",
      "/household-setup",
      <main>
        <button type="button" onClick={mutate}>Create household</button>
      </main>
    );

    expect(await screen.findByText("Update password")).toBeInTheDocument();
    expect(screen.queryByText("Create household")).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("blocks recovery sessions from invitation acceptance before it can render or mutate", async () => {
    const mutate = vi.fn();

    renderRecoveryRoute(
      "/invite/invite-token",
      "/invite/:token",
      <main>
        <button type="button" onClick={mutate}>Accept invitation</button>
      </main>
    );

    expect(await screen.findByText("Update password")).toBeInTheDocument();
    expect(screen.queryByText("Accept invitation")).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("preserves normal household setup and invitation route rendering", async () => {
    authState.isPasswordRecovery = false;

    const { unmount } = renderRecoveryRoute(
      "/household-setup",
      "/household-setup",
      <main>Household setup</main>
    );
    expect(await screen.findByText("Household setup")).toBeInTheDocument();
    unmount();

    renderRecoveryRoute(
      "/invite/invite-token",
      "/invite/:token",
      <main>Invitation acceptance</main>
    );
    expect(await screen.findByText("Invitation acceptance")).toBeInTheDocument();
  });
});
