import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";

/**
 * Custom hook to access authentication context
 * Must be used within an AuthProvider component
 * @returns Authentication context with user session, role and auth methods
 */
export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider");
  }
  return context;
};
