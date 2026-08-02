import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { getPasswordRecoverySnapshot, subscribeToPasswordRecovery, supabase } from "../../lib/supabaseClient";

const MIN_PASSWORD_LENGTH = 8;
const RECOVERY_LINK_ERROR = "This password reset link is invalid or has expired. Request a new reset link and try again.";
const PASSWORD_UPDATE_ERROR = "We couldn't update your password. Request a new reset link and try again.";
const SIGN_OUT_ERROR = "Your password was updated, but we couldn't finish signing you out. Close this page and sign in again.";

type Status = {
  message: string;
  tone: "error" | "success";
};

type FieldErrors = {
  password?: string;
  confirmation?: string;
};

export function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [recoverySessionReady, setRecoverySessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [status, setStatus] = useState<Status | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const updateRecoveryState = (snapshot: ReturnType<typeof getPasswordRecoverySnapshot>) => {
      if (snapshot.active && snapshot.session) {
        setRecoverySessionReady(true);
        setCheckingSession(false);
      } else {
        setRecoverySessionReady(false);
      }
    };

    // The client-level subscriber captures PASSWORD_RECOVERY before this page
    // mounts; the snapshot handles deep-link timing without accepting ordinary sessions.
    updateRecoveryState(getPasswordRecoverySnapshot());
    const unsubscribe = subscribeToPasswordRecovery((snapshot) => {
      if (mounted) {
        updateRecoveryState(snapshot);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) {
        return;
      }

      const recoverySnapshot = getPasswordRecoverySnapshot();
      setRecoverySessionReady(Boolean(
        session &&
        recoverySnapshot.active &&
        recoverySnapshot.session &&
        session.user.id === recoverySnapshot.session.user.id
      ));
      setCheckingSession(false);
    }).catch(() => {
      if (mounted) {
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setFieldErrors({});

    if (!recoverySessionReady) {
      setStatus({ message: RECOVERY_LINK_ERROR, tone: "error" });
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      const message = `Use at least ${MIN_PASSWORD_LENGTH} characters for your new password.`;
      setFieldErrors({ password: message });
      return;
    }

    if (password !== confirmation) {
      setFieldErrors({ confirmation: "The passwords do not match." });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus({ message: PASSWORD_UPDATE_ERROR, tone: "error" });
        return;
      }
      setPassword("");
      setConfirmation("");
    } catch {
      setStatus({ message: PASSWORD_UPDATE_ERROR, tone: "error" });
      return;
    } finally {
      setSubmitting(false);
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setStatus({ message: SIGN_OUT_ERROR, tone: "error" });
        return;
      }
    } catch {
      setStatus({ message: SIGN_OUT_ERROR, tone: "error" });
      return;
    }

    setStatus({ message: "Your password has been updated. You can now sign in with your new password.", tone: "success" });
  }

  const statusClassName = `auth-status${status?.tone === "error" ? " status-error" : ""}`;

  return (
    <main className="auth-page auth-page-login">
      <section className="auth-shell" aria-labelledby="update-password-title">
        <header className="auth-brand" aria-label="WhySpend">
          <span className="auth-wordmark">WhySpend</span>
          <p>Spend with purpose</p>
        </header>

        <section className="auth-card" aria-labelledby="update-password-title">
          <h1 className="auth-title" id="update-password-title">Set a new password</h1>
          {checkingSession ? (
            <p className="auth-status" aria-live="polite">Checking your password reset link...</p>
          ) : status?.tone === "success" ? (
            <div className="form-stack">
              <p className="auth-status" aria-live="polite">{status.message}</p>
              <Button className="auth-submit" type="button" icon={<ArrowRight size={18} />} onClick={() => navigate("/auth", { replace: true })}>
                Continue to sign in
              </Button>
            </div>
          ) : !recoverySessionReady ? (
            <div className="form-stack">
              <p className="auth-status status-error" aria-live="polite">{RECOVERY_LINK_ERROR}</p>
              <Button className="auth-submit" type="button" onClick={() => navigate("/auth", { replace: true })}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form className="auth-form form-stack" onSubmit={onSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="new-password">New password</label>
                <div className="auth-input-wrap">
                  <LockKeyhole aria-hidden="true" />
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFieldErrors((errors) => ({ ...errors, password: undefined }));
                    }}
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH}
                    required
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "new-password-hint new-password-error" : "new-password-hint"}
                  />
                </div>
                <p id="new-password-hint" className="auth-hint">Must be at least {MIN_PASSWORD_LENGTH} characters long.</p>
                {fieldErrors.password ? <p id="new-password-error" className="field-error" role="alert">{fieldErrors.password}</p> : null}
              </div>

              <div className="auth-field">
                <label htmlFor="confirm-password">Confirm new password</label>
                <div className="auth-input-wrap">
                  <LockKeyhole aria-hidden="true" />
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={confirmation}
                    onChange={(event) => {
                      setConfirmation(event.target.value);
                      setFieldErrors((errors) => ({ ...errors, confirmation: undefined }));
                    }}
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH}
                    required
                    aria-invalid={Boolean(fieldErrors.confirmation)}
                    aria-describedby={fieldErrors.confirmation ? "confirm-password-error" : undefined}
                  />
                </div>
                {fieldErrors.confirmation ? <p id="confirm-password-error" className="field-error" role="alert">{fieldErrors.confirmation}</p> : null}
              </div>

              <p className={statusClassName} aria-live="polite">
                {status?.message ?? "Choose a new password for your WhySpend account."}
              </p>
              <Button className="auth-submit" type="submit" loading={submitting} icon={!submitting ? <ArrowRight size={18} /> : undefined}>
                Update password
              </Button>
            </form>
          )}
        </section>
      </section>
    </main>
  );
}
