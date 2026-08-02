import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ShellRoute } from "../src/app/router";
import { authenticatedAuthState, renderWithRouter } from "./test-utils";

vi.mock("../src/app/authState", () => ({
  useAuth: () => authenticatedAuthState
}));

function renderShell(route = "/dashboard") {
  return renderWithRouter(
    <Routes>
      <Route element={<ShellRoute />}>
        <Route path="/dashboard" element={<main>Dashboard content</main>} />
        <Route path="/transactions" element={<main>Transactions content</main>} />
        <Route path="/savings-goals" element={<main>Savings goals content</main>} />
        <Route path="/settings" element={<main>Settings content</main>} />
        <Route path="/support" element={<main>Support content</main>} />
      </Route>
    </Routes>,
    { route }
  );
}

describe("OpenDesign app shell", () => {
  it("renders desktop navigation without bottom account, Support, or sign-out controls", () => {
    renderShell("/dashboard");

    const desktopShell = screen.getByTestId("desktop-shell");
    expect(within(desktopShell).getByRole("link", { name: /dashboard/i })).toHaveClass("active");
    expect(within(desktopShell).getByRole("link", { name: /transactions/i })).toBeInTheDocument();
    expect(within(desktopShell).getByRole("link", { name: /savings goals/i })).toBeInTheDocument();
    expect(within(desktopShell).getByRole("link", { name: /settings/i })).toBeInTheDocument();
    expect(within(desktopShell).queryByRole("link", { name: /support/i })).not.toBeInTheDocument();
    expect(within(desktopShell).queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
    expect(within(desktopShell).queryByText("Okza")).not.toBeInTheDocument();
  });

  it("keeps household context in the rail and moves sign out into the top profile menu", async () => {
    const signOut = vi.spyOn(authenticatedAuthState, "signOut");
    renderShell("/settings");

    const desktopShell = screen.getByTestId("desktop-shell");
    expect(within(desktopShell).getByText("WhySpend")).toBeInTheDocument();
    expect(within(desktopShell).getByText("Home")).toBeInTheDocument();

    const accountButton = screen.getByRole("button", { name: /okza/i });
    expect(accountButton).toHaveAttribute("aria-haspopup", "menu");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await userEvent.click(accountButton);
    const accountMenu = screen.getByRole("menu");
    await userEvent.click(within(accountMenu).getByRole("menuitem", { name: /sign out/i }));

    expect(signOut).toHaveBeenCalledTimes(1);
    signOut.mockRestore();
  });
});
