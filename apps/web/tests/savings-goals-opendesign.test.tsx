import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SavingsGoalsPage } from "../src/features/savings-goals/SavingsGoalsPage";
import { authenticatedAuthState } from "./test-utils";

vi.mock("../src/app/authState", () => ({
  useAuth: () => authenticatedAuthState
}));

vi.mock("../src/lib/api/savingsGoals", () => ({
  listSavingsGoals: vi.fn(async () => ({
    goals: [
      {
        id: "goal-1",
        householdId: "household-1",
        categoryId: "category-1",
        name: "Emas",
        targetAmount: 10_000_000,
        startingAmount: 0,
        savedAmount: 7_600_000,
        targetDate: "2026-12-31",
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z"
      }
    ]
  })),
  createSavingsGoal: vi.fn(async () => ({ id: "goal-2" })),
  updateSavingsGoal: vi.fn(async () => ({ id: "goal-1" })),
  deleteSavingsGoal: vi.fn(async () => ({ ok: true }))
}));

describe("OpenDesign savings goals conversion", () => {
  it("renders progress summary, goal cards, action menus, add form, and delete confirmation", async () => {
    const { container } = render(<SavingsGoalsPage />);

    expect(screen.getByRole("heading", { name: /savings goals/i })).toBeInTheDocument();
    expect(screen.getByText("Total savings progress")).toBeInTheDocument();
    expect(await screen.findByText("Emas")).toBeInTheDocument();
    expect(container.querySelector('[data-od-id="savings-head"]')).not.toBeNull();
    expect(container.querySelector('[data-od-id="savings-summary"]')).not.toBeNull();
    expect(container.querySelector('[data-od-id="goal-cards"]')).not.toBeNull();

    const goalCard = container.querySelector(".goal-card");
    expect(goalCard?.querySelector(".card-head.goal-card-head .row-icon")).not.toBeNull();
    expect(goalCard?.querySelector(".card-head.goal-card-head .goal-menu-button")).not.toBeNull();
    expect(goalCard?.querySelector(".card-title")?.textContent).toContain("Emas");
    expect(goalCard?.querySelector(".card-subtitle")?.textContent).toMatch(/Rp/);
    expect(goalCard?.querySelector(".goal-meta-row")?.textContent).toMatch(/Dec 2026/);
    expect(goalCard?.querySelector(".goal-meta-row")?.textContent).toMatch(/Progress/);

    await userEvent.click(screen.getByRole("button", { name: /add new goal/i }));
    const addDialog = screen.getByRole("dialog", { name: /add new goal/i });
    expect(addDialog).toBeInTheDocument();
    expect(addDialog.querySelector(".goal-modal-head")).not.toBeNull();
    expect(addDialog.querySelector(".goal-modal-close")).not.toBeNull();
    expect(addDialog.querySelectorAll(".currency-prefix")).toHaveLength(2);
    expect(addDialog.querySelector(".goal-input-wrap")).not.toBeNull();
    expect(addDialog.querySelector(".goal-share-card")).not.toBeNull();
    expect(addDialog.querySelector(".goal-modal-footer")).not.toBeNull();
    expect(screen.getByLabelText("Goal name")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await userEvent.click(screen.getByRole("button", { name: /open emas menu/i }));
    await userEvent.click(screen.getByRole("menuitem", { name: /^edit$/i }));
    expect(screen.getByRole("dialog", { name: /edit goal/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await userEvent.click(screen.getByRole("button", { name: /open emas menu/i }));
    await userEvent.click(screen.getByRole("menuitem", { name: /^delete$/i }));
    const deleteDialog = screen.getByRole("dialog", { name: /delete goal/i });
    expect(deleteDialog).toBeInTheDocument();
    expect(deleteDialog.querySelector(".delete-goal-head")).not.toBeNull();
    expect(screen.getByRole("heading", { name: /delete goal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^delete$/i })).toBeInTheDocument();
  }, 10_000);
});
