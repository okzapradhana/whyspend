import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";
import { Button } from "../../components/Button";
import { createHousehold } from "../../lib/api/households";
import { useAuth } from "../../app/authState";

export function HouseholdSetupPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("Home");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await createHousehold({ name });
      await refresh();
      navigate("/summary", { replace: true });
    } catch {
      setStatus("Could not create the household workspace.");
    } finally {
      setSubmitting(false);
    }
  }

  const statusClassName = `auth-status${status ? " status-error" : ""}`;

  return (
    <main className="auth-page auth-page-signup">
      <section className="auth-shell" aria-labelledby="setup-title">
        <header className="auth-brand" aria-label="WhySpend">
          <span className="auth-wordmark">WhySpend</span>
          <p>Spend with purpose</p>
        </header>

        <section className="auth-card" aria-labelledby="setup-title">
          {user && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <span className="kicker">Welcome, {user.displayName}</span>
            </div>
          )}

          <h1 className="auth-title" id="setup-title">
            Create your household workspace.
          </h1>

          <p className="muted" style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-6)", color: "var(--fg-3)" }}>
            This is where both members will enter records, manage categories, and review monthly totals.
          </p>

          <form className="auth-form form-stack" onSubmit={onSubmit}>
            <div className="auth-field">
              <label htmlFor="household-name">Household name</label>
              <div className="auth-input-wrap">
                <Home aria-hidden="true" size={18} />
                <input
                  id="household-name"
                  name="householdName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="E.g. Our Cozy Home"
                  required
                />
              </div>
            </div>

            <p className={statusClassName} aria-live="polite">
              {status ?? "Ready to create household"}
            </p>

            <Button
              className="auth-submit"
              type="submit"
              loading={submitting}
              icon={!submitting ? <ArrowRight size={18} /> : undefined}
            >
              Create household
            </Button>
          </form>
        </section>
      </section>
    </main>
  );
}

