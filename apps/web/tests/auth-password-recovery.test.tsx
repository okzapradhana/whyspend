import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthPage } from "../src/features/auth/AuthPage";
import { UpdatePasswordPage } from "../src/features/auth/UpdatePasswordPage";

const authMocks = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  getSession: vi.fn(),
  signOut: vi.fn(),
  getPasswordRecoverySnapshot: vi.fn(),
  subscribeToPasswordRecovery: vi.fn(),
  recoveryListener: null as null | ((snapshot: { active: boolean; session: unknown }) => void)
}));

vi.mock("../src/lib/supabaseClient", () => ({
  supabase: { auth: authMocks },
  getPasswordRecoverySnapshot: authMocks.getPasswordRecoverySnapshot,
  subscribeToPasswordRecovery: authMocks.subscribeToPasswordRecovery
}));

function renderWithRouter(element: React.ReactNode) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe("password recovery", () => {
  beforeEach(() => {
    authMocks.resetPasswordForEmail.mockReset().mockResolvedValue({ data: null, error: null });
    authMocks.updateUser.mockReset().mockResolvedValue({ data: { user: null }, error: null });
    authMocks.getSession.mockReset().mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
    authMocks.signOut.mockReset().mockResolvedValue({ error: null });
    authMocks.getPasswordRecoverySnapshot.mockReset().mockReturnValue({ active: false, session: null });
    authMocks.recoveryListener = null;
    authMocks.subscribeToPasswordRecovery.mockReset().mockImplementation((listener) => {
      authMocks.recoveryListener = listener;
      return vi.fn();
    });
  });

  it("sends a generic reset request using the current browser origin", async () => {
    const user = userEvent.setup();
    renderWithRouter(<AuthPage />);

    await user.click(screen.getByRole("button", { name: /forgot password/i }));
    expect(screen.getByRole("heading", { name: /reset your password/i })).toBeInTheDocument();
    await user.type(screen.getByLabelText("E-mail"), " person@example.com ");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(authMocks.resetPasswordForEmail).toHaveBeenCalledWith("person@example.com", {
      redirectTo: `${window.location.origin}/update-password`
    });
    expect(await screen.findByText(/if an account matches that email/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /reset your password/i })).toBeInTheDocument();
  });

  it("validates the reset email and does not expose provider errors", async () => {
    const user = userEvent.setup();
    authMocks.resetPasswordForEmail.mockResolvedValueOnce({ data: null, error: new Error("User not found") });
    renderWithRouter(<AuthPage />);

    await user.click(screen.getByRole("button", { name: /forgot password/i }));
    await user.type(screen.getByLabelText("E-mail"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(authMocks.resetPasswordForEmail).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("E-mail"));
    await user.type(screen.getByLabelText("E-mail"), "person@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(await screen.findByText(/couldn't send reset instructions/i)).toBeInTheDocument();
    expect(screen.queryByText("User not found")).not.toBeInTheDocument();
  });

  it("does not accept an ordinary authenticated session as password recovery", async () => {
    renderWithRouter(<UpdatePasswordPage />);

    expect(await screen.findByText(/invalid or has expired/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
  });

  it("waits for a PASSWORD_RECOVERY session before showing the update form", async () => {
    const user = userEvent.setup();
    authMocks.getSession.mockResolvedValueOnce({ data: { session: null } });
    renderWithRouter(<UpdatePasswordPage />);

    expect(await screen.findByText(/invalid or has expired/i)).toBeInTheDocument();
    await act(async () => {
      authMocks.recoveryListener?.({ active: true, session: { user: { id: "user-1" } } });
    });
    expect(await screen.findByLabelText("New password")).toBeInTheDocument();

    await user.type(screen.getByLabelText("New password"), "new-password-123");
    await user.type(screen.getByLabelText("Confirm new password"), "new-password-123");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(authMocks.updateUser).toHaveBeenCalledWith({ password: "new-password-123" });
    expect(authMocks.signOut).toHaveBeenCalled();
    expect(await screen.findByText(/your password has been updated/i)).toBeInTheDocument();
  });

  it("uses recovery state captured before the page mounts for a deep link", async () => {
    const session = { user: { id: "user-1" } };
    authMocks.getPasswordRecoverySnapshot.mockReturnValue({ active: true, session });
    authMocks.getSession.mockResolvedValueOnce({ data: { session } });

    renderWithRouter(<UpdatePasswordPage />);

    expect(await screen.findByLabelText("New password")).toBeInTheDocument();
  });

  it("validates new passwords and keeps update errors generic", async () => {
    const user = userEvent.setup();
    authMocks.updateUser.mockResolvedValueOnce({ error: new Error("Password is too common") });
    authMocks.getPasswordRecoverySnapshot.mockReturnValue({ active: true, session: { user: { id: "user-1" } } });
    renderWithRouter(<UpdatePasswordPage />);

    await screen.findByLabelText("New password");
    await user.type(screen.getByLabelText("New password"), "short");
    await user.type(screen.getByLabelText("Confirm new password"), "short");
    await user.click(screen.getByRole("button", { name: /update password/i }));
    expect(screen.getByText("Use at least 8 characters for your new password.")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toHaveAttribute("aria-invalid", "true");
    expect(authMocks.updateUser).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("New password"));
    await user.clear(screen.getByLabelText("Confirm new password"));
    await user.type(screen.getByLabelText("New password"), "new-password-123");
    await user.type(screen.getByLabelText("Confirm new password"), "different-password");
    await user.click(screen.getByRole("button", { name: /update password/i }));
    expect(screen.getByText("The passwords do not match.")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toHaveAttribute("aria-invalid", "true");

    await user.clear(screen.getByLabelText("Confirm new password"));
    await user.type(screen.getByLabelText("Confirm new password"), "new-password-123");
    await user.click(screen.getByRole("button", { name: /update password/i }));
    expect(await screen.findByText(/couldn't update your password/i)).toBeInTheDocument();
    expect(screen.queryByText("Password is too common")).not.toBeInTheDocument();
  });

  it("does not claim full success when sign out fails after the password update", async () => {
    const user = userEvent.setup();
    authMocks.getPasswordRecoverySnapshot.mockReturnValue({ active: true, session: { user: { id: "user-1" } } });
    authMocks.signOut.mockResolvedValueOnce({ error: new Error("network unavailable") });
    renderWithRouter(<UpdatePasswordPage />);

    await screen.findByLabelText("New password");
    await user.type(screen.getByLabelText("New password"), "new-password-123");
    await user.type(screen.getByLabelText("Confirm new password"), "new-password-123");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(authMocks.updateUser).toHaveBeenCalledWith({ password: "new-password-123" });
    expect(await screen.findByText(/password was updated, but we couldn't finish signing you out/i)).toBeInTheDocument();
    expect(screen.queryByText(/you can now sign in with your new password/i)).not.toBeInTheDocument();
  });
});
