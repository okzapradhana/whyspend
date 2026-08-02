import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthPage } from "../src/features/auth/AuthPage";

const setSession = vi.fn(async () => undefined);

vi.mock("../src/app/authState", () => ({
  useAuth: () => ({ setSession })
}));

vi.mock("../src/lib/api/auth", () => ({
  login: vi.fn(async () => ({ token: "jwt", user: { id: "user-1", email: "okza@example.com", displayName: "Okza" } })),
  register: vi.fn(async () => ({ token: "jwt", user: { id: "user-1", email: "okza@example.com", displayName: "Okza" } }))
}));

describe("OpenDesign auth conversion", () => {
  it("renders login and signup fields with password visibility and validation hints", async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByRole("button", { name: /show password/i }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");

    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});
