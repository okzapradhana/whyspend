import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../src/components/Button";
import { EmptyState, LoadingState } from "../src/components/design-system";
import { StatusMessage } from "../src/components/StatusMessage";
import { TransactionList } from "../src/features/transactions/TransactionList";

describe("OpenDesign shared states", () => {
  it("renders loading, empty, error, success, and disabled/loading button states", () => {
    render(
      <>
        <LoadingState>Loading dashboard...</LoadingState>
        <EmptyState>
          <h2>No transactions yet</h2>
          <p>Add an income, expense, or savings record to start the month.</p>
        </EmptyState>
        <StatusMessage tone="error">Could not load dashboard.</StatusMessage>
        <StatusMessage tone="success">Budget saved.</StatusMessage>
        <Button loading>Save changes</Button>
        <TransactionList transactions={[]} loading={false} onEdit={() => undefined} onDelete={() => undefined} />
      </>
    );

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /no transactions yet/i })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load dashboard.");
    expect(screen.getAllByRole("status")).toHaveLength(2);
    expect(screen.getByText("Budget saved.")).toHaveAttribute("role", "status");
    expect(screen.getByRole("button", { name: /working/i })).toBeDisabled();
    expect(screen.getByText(/no transactions for this month/i)).toBeInTheDocument();
  });
});
