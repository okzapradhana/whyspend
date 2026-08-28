import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Dialog } from "../src/components/Dialog";

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open review dialog</button>
      <Dialog title="Review dialog" description="Keyboard focus stays inside." open={open} onClose={() => setOpen(false)}>
        <label htmlFor="review-name">Name</label>
        <input id="review-name" />
        <button type="button">Save review</button>
      </Dialog>
    </>
  );
}

describe("Dialog accessibility", () => {
  it("contains forward and reverse tab focus, inerts the background, locks scroll, and restores focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<DialogHarness />);
    const opener = screen.getByRole("button", { name: "Open review dialog" });

    await user.click(opener);

    const dialog = screen.getByRole("dialog", { name: "Review dialog" });
    const close = screen.getByRole("button", { name: "Close Review dialog" });
    const save = screen.getByRole("button", { name: "Save review" });
    expect(dialog).toBeInTheDocument();
    expect(close).toHaveFocus();
    expect(container).toHaveAttribute("aria-hidden", "true");
    expect(container).toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("hidden");

    await user.tab({ shift: true });
    expect(save).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Review dialog" })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(container).not.toHaveAttribute("aria-hidden");
    expect(container).not.toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("");
  });
});
