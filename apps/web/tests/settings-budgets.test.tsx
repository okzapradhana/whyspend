import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryBudgetRow } from "../src/features/settings/CategoryBudgetRow";

describe("settings budgets UI", () => {
  it("validates positive amounts and saves category budgets", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onRemove = vi.fn().mockResolvedValue(undefined);
    render(
      <CategoryBudgetRow
        category={{ categoryId: "c1", categoryName: "Subscription", isArchived: false, budget: null }}
        onSave={onSave}
        onRemove={onRemove}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(screen.getByText(/positive budget amount/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/monthly limit/i), "500000");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(500000);
  });
});
