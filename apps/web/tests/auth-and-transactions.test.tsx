import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthPage } from "../src/features/auth/AuthPage";
import { TransactionForm } from "../src/features/transactions/TransactionForm";

vi.mock("../src/app/authState", () => ({
  useAuth: () => ({
    setSession: vi.fn()
  })
}));

vi.mock("../src/lib/api/auth", () => ({
  login: vi.fn(async () => ({ token: "jwt", user: { id: "u1", email: "a@b.com", displayName: "Okza" } })),
  register: vi.fn(async () => ({ token: "jwt", user: { id: "u1", email: "a@b.com", displayName: "Okza" } }))
}));

vi.mock("../src/lib/api/categories", () => ({
  listCategories: vi.fn(async () => ({
    categories: [{ id: "c1", name: "Subscription", type: "expense", scope: "member", isArchived: false }]
  }))
}));

vi.mock("../src/lib/api/transactions", () => ({
  createTransaction: vi.fn(async () => ({})),
  updateTransaction: vi.fn(async () => ({}))
}));

describe("auth and transaction UI", () => {
  it("renders accessible sign-in fields", () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("allows entering a transaction with category, scope, and note", async () => {
    const onSaved = vi.fn();
    render(<TransactionForm householdId="h1" userId="u1" onSaved={onSaved} />);

    await userEvent.type(screen.getByLabelText(/amount/i), "281000");
    await userEvent.type(screen.getByLabelText(/note/i), "Monthly subscription");
    await userEvent.click(await screen.findByRole("button", { name: /^add$/i }));

    expect(onSaved).toHaveBeenCalled();
  }, 10_000);
});
