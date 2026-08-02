import { screen, waitFor, within } from "@testing-library/react";
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

describe("OpenDesign mobile shell", () => {
  it("opens and closes the hamburger drawer", async () => {
    renderShell();

    const menuButton = screen.getByRole("button", { name: /menu/i });
    const drawer = document.getElementById("mobile-navigation");

    expect(drawer).toHaveAttribute("aria-hidden", "true");
    await userEvent.click(menuButton);
    expect(drawer).toHaveAttribute("aria-hidden", "false");
    expect(within(drawer as HTMLElement).getByRole("link", { name: /savings goals/i })).toBeInTheDocument();
    expect(within(drawer as HTMLElement).queryByRole("link", { name: /support/i })).not.toBeInTheDocument();
    expect(within(drawer as HTMLElement).queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
    expect(within(drawer as HTMLElement).queryByText("Okza")).not.toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(drawer).toHaveAttribute("aria-hidden", "true"));
    await waitFor(() => expect(menuButton).toHaveFocus());
  });

  it("closes after mobile route selection", async () => {
    renderShell();

    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    const drawer = document.getElementById("mobile-navigation") as HTMLElement;
    await userEvent.click(within(drawer).getByRole("link", { name: /transactions/i }));

    await waitFor(() => expect(drawer).toHaveAttribute("aria-hidden", "true"));
    expect(screen.getByText("Transactions content")).toBeInTheDocument();
  });
});
