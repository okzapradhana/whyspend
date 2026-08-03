import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, User } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { getPasswordRecoveryRedirectUrl } from "../../lib/authRedirect";
import { supabase } from "../../lib/supabaseClient";

const RESET_REQUEST_MESSAGE = "If an account matches that email, we sent password reset instructions. Check your inbox.";
const RESET_REQUEST_FAILURE = "We couldn't send reset instructions. Try again later.";

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const statusClassName = `auth-status${status?.tone === "error" ? " status-error" : ""}`;

  function showPlaceholder(message: string) {
    setStatus({ message, tone: "error" });
  }

  function changeMode(nextMode: "login" | "register" | "forgot") {
    setMode(nextMode);
    setStatus(null);
    setPassword("");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      if (mode === "forgot") {
        const normalizedEmail = email.trim();
        if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
          setStatus({ message: "Enter a valid email address.", tone: "error" });
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: getPasswordRecoveryRedirectUrl()
        });
        if (error) {
          setStatus({ message: RESET_REQUEST_FAILURE, tone: "error" });
          return;
        }
        setStatus({
          message: RESET_REQUEST_MESSAGE,
          tone: "success"
        });
        return;
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { displayName }
          }
        });
        if (error) throw error;
        
        // Create profile in our User table
        if (data.user) {
          const { error: userError } = await supabase.from("User").insert({
            id: data.user.id,
            email,
            displayName,
            password: "", // placeholder
            updatedAt: new Date().toISOString()
          });
          if (userError) {
            console.error("Failed to insert user profile:", userError);
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      
      const inviteToken = searchParams.get("invite");
      navigate(inviteToken ? `/invite/${inviteToken}` : "/dashboard", { replace: true });
    } catch (error: any) {
      setStatus(mode === "forgot"
        ? { message: RESET_REQUEST_FAILURE, tone: "error" }
        : { message: error?.message || "Could not sign in. Check your details and try again.", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <main className={`auth-page ${mode === "register" ? "auth-page-signup" : "auth-page-login"}`}>
      <section className="auth-shell" aria-labelledby="auth-title" data-od-id={mode === "register" ? "signup-auth" : "login-auth"}>
        <header className="auth-brand" aria-label="WhySpend">
          <span className="auth-wordmark">WhySpend</span>
          <p>Spend with purpose</p>
        </header>

        <section className="auth-card" aria-labelledby="auth-title">
          <h1 className="auth-title" id="auth-title">{mode === "register" ? "Create account" : mode === "forgot" ? "Reset your password" : "Welcome back"}</h1>
          {mode === "forgot" ? <p className="auth-hint">Enter your email and we’ll send instructions if an account matches it.</p> : null}
          <form className="auth-form form-stack" onSubmit={onSubmit} noValidate={mode === "forgot"}>
            {mode === "register" ? (
              <div className="auth-field">
                <label htmlFor="display-name">Display name</label>
                <div className="auth-input-wrap">
                  <User aria-hidden="true" />
                  <input
                    id="display-name"
                    name="displayName"
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="E.g. Alex & Sam"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>
            ) : null}

            <div className="auth-field">
              <label htmlFor="email">{mode === "register" ? "Email address" : "E-mail"}</label>
              <div className="auth-input-wrap">
                <Mail aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={mode === "register" ? "hello@ourhome.com" : "hello@oursharedlife.com"}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {mode !== "forgot" ? <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password">Password</label>
                {mode === "login" ? (
                  <button type="button" className="auth-link-button" onClick={() => changeMode("forgot")}>
                    Forgot password?
                  </button>
                ) : null}
              </div>
              <div className="auth-input-wrap">
                <LockKeyhole aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  required
                  minLength={mode === "register" ? 8 : 1}
                  aria-describedby={mode === "register" ? "password-hint" : undefined}
                />
                <button
                  className={`auth-icon-button${showPassword ? " active" : ""}`}
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
              {mode === "register" ? (
                <p id="password-hint" className="auth-hint">Must be at least 8 characters long.</p>
              ) : null}
            </div> : null}

            {mode === "forgot" ? <p className="auth-hint">We’ll never reveal whether an email is linked to an account.</p> : null}

            <p className={statusClassName} aria-live="polite">
              {status?.message ?? (mode === "register" ? "Ready to create account" : mode === "forgot" ? "Ready to send reset instructions" : "Ready to sign in")}
            </p>
            <Button className="auth-submit" type="submit" loading={submitting} icon={!submitting ? <ArrowRight size={18} /> : undefined}>
              {mode === "register" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
            </Button>
          </form>

          {mode !== "forgot" ? <>
            <div className="auth-divider" aria-hidden="true"><span>{mode === "register" ? "Or sign up with" : "Or"}</span></div>
            <button className="auth-social" type="button" onClick={() => showPlaceholder("Google sign-in is not available in phase 1.")}>
              <span className="auth-social-mark" aria-hidden="true">G</span>
              <span>Continue with Google</span>
            </button>
          </> : null}

          {mode === "login" ? (
            <p className="auth-switch auth-switch-card">
              Don't have an account? <button type="button" className="auth-link-button" onClick={() => changeMode("register")}>Create account</button>
            </p>
          ) : null}
          {mode === "forgot" ? (
            <p className="auth-switch auth-switch-card">
              Remember your password? <button type="button" className="auth-link-button" onClick={() => changeMode("login")}>Back to sign in</button>
            </p>
          ) : null}
        </section>

        {mode === "register" ? (
          <>
            <p className="auth-switch">Already have an account? <button type="button" className="auth-link-button" onClick={() => changeMode("login")}>Login</button></p>
            <p className="auth-policy">By signing up, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
          </>
        ) : (
          <footer className="auth-footer">
            <p><ShieldCheck aria-hidden="true" /> Bank-level security & encryption</p>
            <nav aria-label="Legal links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </nav>
          </footer>
        )}
      </section>
    </main>
  );
}
