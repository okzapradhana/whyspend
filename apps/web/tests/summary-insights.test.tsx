import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InsightStories } from "../src/features/summaries/InsightStories";

describe("summary insight stories", () => {
  it("renders calm story copy and links back to source category records", async () => {
    const onSelect = vi.fn();
    render(
      <InsightStories
        stories={[{ id: "s1", type: "over_budget", priority: 1, title: "Budget needs attention", body: "Food is IDR 50,000 over its monthly budget.", categoryId: "c1", amount: 250000, comparisonAmount: 200000, percentOfExpenses: 90, severity: "attention", sourceRefs: ["c1"] }]}
        onSelectCategory={onSelect}
      />
    );
    expect(screen.getByText(/needs attention/i)).toBeInTheDocument();
    expect(screen.queryByText(/shame|failed|bad/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /view records/i }));
    expect(onSelect).toHaveBeenCalledWith("c1");
  });
});
