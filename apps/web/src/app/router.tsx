import { useEffect, useRef, useState } from "react";
import { BarChart3, LogOut, Menu, ReceiptText, Settings, Target, X } from "lucide-react";
import { createBrowserRouter, Link, NavLink, Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { LoadingState, PageHeader, Surface } from "../components/design-system";
import { AuthPage } from "../features/auth/AuthPage";
import { HouseholdSetupPage } from "../features/auth/HouseholdSetupPage";
import { UpdatePasswordPage } from "../features/auth/UpdatePasswordPage";
import { SavingsGoalsPage } from "../features/savings-goals/SavingsGoalsPage";
import { SummaryPage } from "../features/summaries/SummaryPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { TransactionsPage } from "../features/transactions/TransactionsPage";
import { useAuth } from "./authState";
import {
  acceptHouseholdInvitation,
  isHouseholdInvitationExpiredError,
  refreshHouseholdInvitation
} from "../lib/api/households";

const primaryNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: <BarChart3 size={18} /> },
  { to: "/transactions", label: "Transactions", icon: <ReceiptText size={18} /> },
  { to: "/savings-goals", label: "Savings goals", icon: <Target size={18} /> }
];

const secondaryNavItems = [
  { to: "/settings", label: "Settings", icon: <Settings size={18} /> }
];

function BrandLockup({ householdName }: { householdName?: string }) {
  return (
    <div className="brand brand-lockup">
      <span className="brand-mark" aria-hidden="true">
        <img src="/logo.png" alt="" className="brand-logo-img" />
      </span>
      <div>
        <strong className="brand-title">WhySpend</strong>
        <span className="brand-subtitle">{householdName ?? "Household finance"}</span>
      </div>
    </div>
  );
}

function ShellNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <nav className="nav-group nav-list" aria-label="Main navigation">
        {primaryNavItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} onClick={onNavigate}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <nav className="nav-group nav-list nav-secondary" aria-label="Secondary navigation">
        {secondaryNavItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} onClick={onNavigate}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export function ShellRoute() {
  const { user, activeHousehold, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const accountButtonRef = useRef<HTMLButtonElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const closeDrawer = () => {
    setDrawerOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const firstLink = drawerRef.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (accountButtonRef.current?.contains(target) || accountMenuRef.current?.contains(target)) {
        return;
      }
      setAccountMenuOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setAccountMenuOpen(false);
        requestAnimationFrame(() => accountButtonRef.current?.focus());
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

  function onSignOut() {
    setAccountMenuOpen(false);
    signOut();
  }

  return (
    <div className="app-shell app-frame">
      <aside className="sidebar" aria-label="Main navigation" data-testid="desktop-shell">
        <BrandLockup householdName={activeHousehold?.name} />
        <ShellNav />
      </aside>
      <div className="screen">
        <header className="mobile-bar">
          <BrandLockup householdName={activeHousehold?.name} />
          <Button
            ref={menuButtonRef}
            type="button"
            variant="secondary"
            icon={drawerOpen ? <X size={18} /> : <Menu size={18} />}
            aria-expanded={drawerOpen}
            aria-controls="mobile-navigation"
            onClick={() => setDrawerOpen((open) => !open)}
          >
            Menu
          </Button>
        </header>
        <div className={`drawer-backdrop mobile-drawer-backdrop${drawerOpen ? " is-open" : ""}`} role="presentation" onMouseDown={closeDrawer} />
        <div id="mobile-navigation" ref={drawerRef} className={`mobile-drawer${drawerOpen ? " is-open" : ""}`} aria-hidden={!drawerOpen}>
          <aside className="sidebar" aria-label="Mobile navigation" data-testid="mobile-shell">
            <BrandLockup householdName={activeHousehold?.name} />
            <ShellNav onNavigate={closeDrawer} />
          </aside>
        </div>
        {user ? (
          <div className="top-actions" aria-label="Account actions">
            <button
              ref={accountButtonRef}
              type="button"
              className="account-pill account-menu-trigger"
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              aria-controls="account-menu"
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              <div className="avatar-stack" aria-hidden="true">
                <span className="avatar">{user.displayName?.slice(0, 1).toUpperCase() ?? "W"}</span>
              </div>
              <span>{user.displayName}</span>
            </button>
            {accountMenuOpen ? (
              <div id="account-menu" className="account-menu" role="menu" ref={accountMenuRef}>
                <button type="button" role="menuitem" onClick={onSignOut}>
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        <Outlet />
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { user, activeHousehold, isPasswordRecovery, loading } = useAuth();

  if (isPasswordRecovery) {
    return <Navigate to="/update-password" replace />;
  }
  if (loading) {
    return <main className="page"><LoadingState>Loading workspace...</LoadingState></main>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (!activeHousehold) {
    return <Navigate to="/household-setup" replace />;
  }
  return <Outlet />;
}

export function AuthOnlyRoute() {
  const { user, activeHousehold, isPasswordRecovery } = useAuth();

  if (isPasswordRecovery) {
    return <Navigate to="/update-password" replace />;
  }
  if (user && activeHousehold) {
    return <Navigate to="/dashboard" replace />;
  }
  if (user) {
    return <Navigate to="/household-setup" replace />;
  }
  return <Outlet />;
}

export function RecoveryRouteGuard() {
  const { isPasswordRecovery } = useAuth();

  if (isPasswordRecovery) {
    return <Navigate to="/update-password" replace />;
  }
  return <Outlet />;
}

function SupportPage() {
  return (
    <main className="content page narrow-page">
      <PageHeader>
        <div>
          <span className="page-kicker kicker">Support</span>
          <h1 className="page-title">Household support</h1>
          <p>Send questions, data corrections, or setup requests to the household owner for now.</p>
        </div>
      </PageHeader>
      <Surface>
        <h2>Current support path</h2>
        <p>Support is documented as a placeholder route until a dedicated contact workflow is added.</p>
      </Surface>
    </main>
  );
}

function LegalPage({ title, body }: { title: string; body: string }) {
  return (
    <main className="content page narrow-page">
      <PageHeader>
        <div>
          <span className="page-kicker kicker">WhySpend</span>
          <h1 className="page-title">{title}</h1>
          <p>{body}</p>
        </div>
      </PageHeader>
    </main>
  );
}

export function InviteAcceptancePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [status, setStatus] = useState("Checking invitation...");
  const [expired, setExpired] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function accept() {
      if (!token) {
        setStatus("Invitation link is invalid.");
        return;
      }
      if (!user) {
        setStatus("Sign in or create an account with the invited email to join this household.");
        return;
      }
      try {
        const result = await acceptHouseholdInvitation(token);
        await refresh();
        setStatus(`Invitation accepted. Opening ${result.household.name}...`);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        if (isHouseholdInvitationExpiredError(error)) {
          setExpired(true);
          setStatus("This invitation has expired.");
          return;
        }
        setStatus("Could not accept this invitation.");
      }
    }
    accept();
  }, [token, user?.id]);

  async function refreshInvitation() {
    if (!token) return;

    setRefreshing(true);
    try {
      const refreshedInvitation = await refreshHouseholdInvitation(token);
      setStatus("Invitation refreshed. Opening the new invitation...");
      navigate(`/invite/${refreshedInvitation.token}`, { replace: true });
    } catch {
      setStatus("Could not refresh this invitation. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <main className="page narrow-page">
      <Surface>
        <p className="kicker">Household invitation</p>
        <h1>Join a shared WhySpend household</h1>
        <p className="muted">{status}</p>
        {expired && user ? (
          <Button type="button" loading={refreshing} onClick={refreshInvitation}>
            Refresh invitation
          </Button>
        ) : null}
        {!user && token ? (
          <Link className="btn btn-primary" to={`/auth?invite=${token}`}>
            Sign in to continue
          </Link>
        ) : null}
      </Surface>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />
  },
  {
    element: <AuthOnlyRoute />,
    children: [{ path: "/auth", element: <AuthPage /> }]
  },
  {
    path: "/update-password",
    element: <UpdatePasswordPage />
  },
  {
    element: <RecoveryRouteGuard />,
    children: [
      { path: "/household-setup", element: <HouseholdSetupPage /> },
      { path: "/invite/:token", element: <InviteAcceptancePage /> }
    ]
  },
  {
    element: <ShellRoute />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <SummaryPage /> },
          { path: "/summary", element: <SummaryPage /> },
          { path: "/transactions", element: <TransactionsPage /> },
          { path: "/savings-goals", element: <SavingsGoalsPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/support", element: <SupportPage /> }
        ]
      }
    ]
  },
  {
    path: "/privacy",
    element: <LegalPage title="Privacy Policy" body="WhySpend stores account, household, category, budget, transaction, and savings-goal data only to operate the shared money tracker." />
  },
  {
    path: "/terms",
    element: <LegalPage title="Terms of Service" body="WhySpend is a household finance tracker for private use. Phase 1 does not include external payment rails, bank integrations, or recovery workflows." />
  }
]);
