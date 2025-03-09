import { supabase } from "@/lib/supabase";
import { redirectConfig } from "@/lib/supabase/config";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";

export type UserRole = "user" | "merchant" | null;

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: UserRole;
  isLoading: boolean;
  signInWithGoogle: (role?: "merchant" | "user") => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (role: "merchant" | "user") => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return data?.role as UserRole;
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      return null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUserRole(role);
      }

      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUserRole(role);
      } else {
        setUserRole(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (role: "merchant" | "user" = "user") => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectConfig.redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            role: role, // Pass role as a query parameter instead of data
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (role: "merchant" | "user") => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) throw error;

      setUserRole(role);
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserRole(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userRole,
        isLoading,
        signInWithGoogle,
        signOut,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};