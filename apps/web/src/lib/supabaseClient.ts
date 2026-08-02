import { createClient, type Session } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PasswordRecoverySnapshot {
  active: boolean;
  session: Session | null;
}

type PasswordRecoveryListener = (snapshot: PasswordRecoverySnapshot) => void;

let passwordRecoverySnapshot: PasswordRecoverySnapshot = { active: false, session: null };
const passwordRecoveryListeners = new Set<PasswordRecoveryListener>();

function publishPasswordRecoverySnapshot(snapshot: PasswordRecoverySnapshot) {
  passwordRecoverySnapshot = snapshot;
  passwordRecoveryListeners.forEach((listener) => listener(snapshot));
}

// Subscribe at client initialization so a PASSWORD_RECOVERY event emitted while
// Supabase is processing a deep link cannot be missed by the route component.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY" && session) {
    publishPasswordRecoverySnapshot({ active: true, session });
  } else if (event === "SIGNED_OUT") {
    publishPasswordRecoverySnapshot({ active: false, session: null });
  } else if (event === "SIGNED_IN" && !passwordRecoverySnapshot.active) {
    publishPasswordRecoverySnapshot({ active: false, session: null });
  } else if (event === "TOKEN_REFRESHED" && passwordRecoverySnapshot.active && session) {
    publishPasswordRecoverySnapshot({ active: true, session });
  }
});

export function getPasswordRecoverySnapshot() {
  return passwordRecoverySnapshot;
}

export function subscribeToPasswordRecovery(listener: PasswordRecoveryListener) {
  passwordRecoveryListeners.add(listener);
  return () => passwordRecoveryListeners.delete(listener);
}
