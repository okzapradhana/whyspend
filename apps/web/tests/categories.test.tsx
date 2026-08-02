import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryList } from "../src/features/categories/CategoryList";

describe("category management UI", () => {
  it("shows category metadata and exposes edit, archive, and delete actions", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onArchive = vi.fn();
    const onDelete = vi.fn();
    render(
      <CategoryList
        categories={[{ id: "c1", name: "Very long custom category name for home maintenance", type: "expense", scope: "both", isArchived: false }]}
        onEdit={onEdit}
        onArchive={onArchive}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText(/very long custom category/i)).toBeInTheDocument();
    const menuButton = screen.getByRole("button", { name: /open very long custom category/i });

    await user.click(menuButton);
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    await user.click(menuButton);
    await user.click(screen.getByRole("menuitem", { name: "Archive" }));
    await user.click(menuButton);
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(onEdit).toHaveBeenCalled();
    expect(onArchive).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });
});
