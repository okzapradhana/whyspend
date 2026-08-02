import { Copy, MailPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../app/authState";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { StatusMessage } from "../../components/StatusMessage";
import { createHouseholdInvitation, getHousehold } from "../../lib/api/households";
import type { HouseholdInvitation } from "../../lib/api/types";
import { UnifiedCategoryCard } from "./UnifiedCategoryCard";
import "./settings.css";

function HouseholdAccessCard({ householdId }: { householdId: string }) {
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<HouseholdInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copyingInviteId, setCopyingInviteId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  async function loadDetails() {
    setLoading(true);
    try {
      const household = await getHousehold(householdId);
      setInvites(household.invitations ?? []);
    } catch {
      setStatus({ tone: "error", message: "Could not load household access details." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
  }, [householdId]);

  async function inviteSpouse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const invitation = await createHouseholdInvitation(householdId, { email });
      setEmail("");
      await loadDetails();
      try {
        const inviteUrl = invitation.inviteUrl ?? `${window.location.origin}/invite/${invitation.token}`;
        await navigator.clipboard.writeText(inviteUrl);
        setStatus({ tone: "success", message: "Invitation created and copied to clipboard." });
      } catch {
        setStatus({ tone: "success", message: "Invitation created. Copy the invite link from the pending invites list." });
      }
    } catch {
      setStatus({ tone: "error", message: "Could not create the spouse invitation." });
    } finally {
      setSubmitting(false);
    }
  }

  async function copyInvitationLink(invite: HouseholdInvitation) {
    const inviteUrl = invite.inviteUrl ?? `${window.location.origin}/invite/${invite.token}`;
    setCopyingInviteId(invite.id);
    setStatus(null);
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setStatus({ tone: "success", message: "Invitation link copied to clipboard." });
    } catch {
      setStatus({ tone: "error", message: "Clipboard is unavailable. Select the invitation link below and copy it manually." });
    } finally {
      setCopyingInviteId(null);
    }
  }

  return (
    <aside className="card settings-access-card" aria-label="Household access">
      <div className="settings-card-heading">
        <h2>Household access</h2>
        <p>Invite your spouse and keep shared categories visible to both members.</p>
      </div>
      <form className="form-stack" onSubmit={inviteSpouse}>
        <Input
          label="Spouse email"
          name="spouseEmail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="spouse@example.com"
          required
        />
        <Button type="submit" icon={<MailPlus size={16} />} loading={submitting}>
          Invite spouse
        </Button>
      </form>
      {status ? <StatusMessage tone={status.tone}>{status.message}</StatusMessage> : null}
      <div className="settings-invitations">
        <p className="settings-invitations__label">Pending invitation</p>
        {loading ? (
          <div className="settings-invitation-skeleton" aria-label="Loading pending invitations" />
        ) : invites.length ? (
          invites.map((invite) => (
            <div key={invite.id} className="settings-invitation-row">
              <div>
                <strong>{invite.email}</strong>
                <p>Invitation waiting to be accepted</p>
              </div>
              <span className="settings-pending-badge">Pending</span>
              <div className="settings-invitation-link">
                <label htmlFor={`invitation-link-${invite.id}`}>Invitation link</label>
                <input
                  id={`invitation-link-${invite.id}`}
                  type="text"
                  value={invite.inviteUrl ?? `${window.location.origin}/invite/${invite.token}`}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                />
                <Button
                  type="button"
                  variant="secondary"
                  icon={<Copy size={15} />}
                  loading={copyingInviteId === invite.id}
                  onClick={() => copyInvitationLink(invite)}
                >
                  Copy link
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="card-subtitle">No pending spouse invites.</p>
        )}
      </div>
    </aside>
  );
}

export function SettingsPage() {
  const { activeHousehold } = useAuth();

  if (!activeHousehold) return null;

  return (
    <main className="content page settings-page">
      <header className="page-head settings-head page-header" data-od-id="settings-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p>Manage categories, monthly budgets, and household access.</p>
        </div>
      </header>
      <section className="settings-content grid grid-main" data-od-id="settings-content">
        <UnifiedCategoryCard householdId={activeHousehold.id} />
        <HouseholdAccessCard householdId={activeHousehold.id} />
      </section>
    </main>
  );
}
