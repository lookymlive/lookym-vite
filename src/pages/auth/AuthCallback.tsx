import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the intended destination from URL params or localStorage
        const params = new URLSearchParams(location.search);
        const redirectTo = localStorage.getItem("authRedirectTo") || "/profile";

        // Clear the stored redirect path
        localStorage.removeItem("authRedirectTo");

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error in authentication callback:", error);
          setError(error.message);
          toast.error("Error en la autenticación: " + error.message);
          setTimeout(() => navigate("/auth/sign-in"), 2000);
          return;
        }

        if (data.session) {
          // Check if we need to update the user's role from the query params
          const role = params.get("role");
          if (role && (role === "merchant" || role === "user")) {
            try {
              // Update the user's role in the profiles table
              const { error: updateError } = await supabase
                .from("profiles")
                .update({ role, updated_at: new Date().toISOString() })
                .eq("id", data.session.user.id);

              if (updateError) {
                console.error("Error updating user role:", updateError);
              }
            } catch (roleError) {
              console.error("Error setting user role:", roleError);
            }
          }

          toast.success("Inicio de sesión exitoso");
          navigate(redirectTo);
        } else {
          console.error("No session found after authentication");
          setError("No se encontró una sesión después de la autenticación");
          toast.error(
            "Error en la autenticación: No se pudo obtener la sesión"
          );
          setTimeout(() => navigate("/auth/sign-in"), 2000);
        }
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        setError("Error inesperado durante la autenticación");
        toast.error("Error inesperado durante la autenticación");
        setTimeout(() => navigate("/auth/sign-in"), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        {error ? (
          <>
            <div className="text-destructive text-xl mb-4">
              Error de autenticación
            </div>
            <p className="text-muted-foreground">{error}</p>
            <p className="mt-4">
              Redirigiendo a la página de inicio de sesión...
            </p>
          </>
        ) : (
          <>
            <svg
              className="animate-spin h-12 w-12 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-4 text-lg">Procesando inicio de sesión...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
