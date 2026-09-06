import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  // Fetch the user's profile from public.users
  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("PROFILE FETCH ERROR:", error);
      setProfile(null);
      return null;
    }

    console.log("PROFILE FETCHED:", data);
    setProfile(data);
    return data;
  };

  // Claim approved waitlist access if applicable
  const claimApprovedAccess = async (authUser) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    if (!authUser || !token) return;

    try {
      await fetch("/api/waitlist/claim-approved-access", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Non-fatal
    }
  };

  useEffect(() => {
    // Detect password recovery URL
    const isRecoveryUrl =
      window.location.hash.includes("type=recovery") ||
      new URLSearchParams(window.location.search).get("type") === "recovery";

    if (isRecoveryUrl) {
      setPasswordRecovery(true);
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;

      setUser(authUser);

      if (authUser) {
        setLoading(true);

        claimApprovedAccess(authUser)
          .catch(() => { })
          .finally(async () => {
            await fetchProfile(authUser.id);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authUser = session?.user ?? null;

      // Password recovery event
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
      }

      setUser(authUser);

      if (authUser) {
        setLoading(true);

        setProfile(null);

        claimApprovedAccess(authUser)
          .catch(() => { })
          .finally(async () => {
            await fetchProfile(authUser.id);
            setLoading(false);
          });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up
  const signUp = async (email, password, fullName) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (!result.error && result.data?.user) {
      await claimApprovedAccess(result.data.user);
      await fetchProfile(result.data.user.id);
    }

    return result;
  };

  // Sign in
  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({
      email,
      password,
    });

  // Google login
  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

  // Send password reset email
  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

  // Update password after recovery
  const updatePassword = (password) =>
    supabase.auth.updateUser({
      password,
    });

  // Finish recovery mode
  const finishPasswordRecovery = () => {
    setPasswordRecovery(false);
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);
    setPasswordRecovery(false);
  };

  // Manually refresh profile
  const refreshProfile = async () => {
    if (!user) return null;

    setLoading(true);

    try {
      const data = await fetchProfile(user.id);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        passwordRecovery,
        signUp,
        signIn,
        signInWithGoogle,
        resetPassword,
        updatePassword,
        finishPasswordRecovery,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return ctx;
}