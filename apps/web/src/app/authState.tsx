import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getPasswordRecoverySnapshot,
  subscribeToPasswordRecovery,
  supabase
} from "../lib/supabaseClient";
import type { Household, User } from "../lib/api/types";

interface AuthState {
  user: User | null;
  households: Household[];
  activeHousehold: Household | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  setSession: (token: string, user: User) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(
    () => getPasswordRecoverySnapshot().active
  );

  const refresh = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const recoverySnapshot = getPasswordRecoverySnapshot();
    setIsPasswordRecovery(Boolean(
      session &&
      recoverySnapshot.active &&
      recoverySnapshot.session &&
      session.user.id === recoverySnapshot.session.user.id
    ));

    if (!session) {
      setUser(null);
      setHouseholds([]);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch user profile from the database
      let { data: dbUser, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (userError) throw userError;

      // 2. Resilient check: If user profile doesn't exist yet, create it
      if (!dbUser) {
        const displayName = session.user.user_metadata?.displayName || session.user.email?.split("@")[0] || "User";
        const email = session.user.email || "";
        const { data: insertedUser, error: insertError } = await supabase
          .from("User")
          .insert({
            id: session.user.id,
            email,
            displayName,
            password: "", // password hashing is handled by Supabase Auth, so this is a placeholder for public table compatibility
            updatedAt: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        dbUser = insertedUser;
      }

      // 3. Fetch user's households
      const { data: memberships, error: membershipError } = await supabase
        .from("HouseholdMember")
        .select(`
          role,
          household:Household (
            id,
            name
          )
        `)
        .eq("userId", session.user.id);

      if (membershipError) throw membershipError;

      const formattedHouseholds: Household[] = (memberships || []).map((m: any) => ({
        id: m.household.id,
        name: m.household.name,
        role: m.role
      }));

      setUser({
        id: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName
      });
      setHouseholds(formattedHouseholds);
    } catch (err) {
      console.error("Failed to load user session data:", err);
      setUser(null);
      setHouseholds([]);
    } finally {
      setLoading(false);
    }
  };

  // Legacy setSession maintained for code compatibility, but actual session is managed by Supabase Auth
  const setSession = async (_token: string, _nextUser: User) => {
    await refresh();
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setIsPasswordRecovery(false);
    setUser(null);
    setHouseholds([]);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribeRecovery = subscribeToPasswordRecovery((snapshot) => {
      setIsPasswordRecovery(snapshot.active);
    });

    // Initial refresh
    refresh();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await refresh();
      } else if (event === "SIGNED_OUT") {
        setIsPasswordRecovery(false);
        setUser(null);
        setHouseholds([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeRecovery();
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      households,
      activeHousehold: households[0] ?? null,
      loading,
      isPasswordRecovery,
      setSession,
      refresh,
      signOut
    }),
    [user, households, loading, isPasswordRecovery]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
