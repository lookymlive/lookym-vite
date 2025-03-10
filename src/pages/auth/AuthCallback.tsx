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
        console.log("Starting auth callback process");
        // Get the intended destination from URL params or localStorage
        const params = new URLSearchParams(location.search);
        const redirectTo = localStorage.getItem("authRedirectTo") || "/profile";

        // Clear the stored redirect path
        localStorage.removeItem("authRedirectTo");

        // First, process the OAuth code in the URL if it exists
        // This is critical for the initial session establishment
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        console.log("Hash params present:", !!window.location.hash);
        console.log("Access token present:", !!accessToken);

        // Check if we're in a callback URL with hash parameters
        if (accessToken) {
          console.log("Setting session with access token");
          // If we have an access token in the URL, set the session manually
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });

          if (sessionError) {
            console.error("Error setting session:", sessionError);
            setError(sessionError.message);
            toast.error("Error en la autenticación: " + sessionError.message);
            setTimeout(() => navigate("/auth/sign-in"), 2000);
            return;
          }

          if (!sessionData.session) {
            console.error("No session found after setting session");
            setError("No se pudo establecer la sesión");
            toast.error(
              "Error en la autenticación: No se pudo establecer la sesión"
            );
            setTimeout(() => navigate("/auth/sign-in"), 2000);
            return;
          }
        }

        // Now get the current session
        console.log("Getting current session");
        const { data, error: sessionError } = await supabase.auth.getSession();
        console.log(
          "Session data:",
          data?.session ? "Session exists" : "No session"
        );

        if (sessionError) {
          console.error("Error in authentication callback:", sessionError);
          setError(sessionError.message);
          toast.error("Error en la autenticación: " + sessionError.message);
          setTimeout(() => navigate("/auth/sign-in"), 2000);
          return;
        }

        if (data.session) {
          console.log("Session found, user ID:", data.session.user.id);
          // Check if we need to update the user's role from the query params
          const role = params.get("role");
          console.log("Role from params:", role);
          if (role && (role === "merchant" || role === "user")) {
            try {
              // First check if the profile exists
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", data.session.user.id)
                .single();

              if (profileError && profileError.code !== "PGRST116") {
                // PGRST116 is the error code for "no rows found"
                console.error("Error checking profile:", profileError);
              }

              // If profile doesn't exist, create it
              if (!profileData) {
                const { error: insertError } = await supabase
                  .from("profiles")
                  .insert({
                    id: data.session.user.id,
                    role,
                    updated_at: new Date().toISOString(),
                  });

                if (insertError) {
                  console.error("Error creating profile:", insertError);
                }
              } else {
                // Update the existing profile
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update({ role, updated_at: new Date().toISOString() })
                  .eq("id", data.session.user.id);

                if (updateError) {
                  console.error("Error updating user role:", updateError);
                }
              }
            } catch (roleError) {
              console.error("Error setting user role:", roleError);
            }
          }

          toast.success("Inicio de sesión exitoso");
          navigate(redirectTo);
        } else {
          console.error("No session found after authentication");

          // Try one more time with exchangeCodeForSession if we have a code in the URL
          const code = params.get("code");
          if (code) {
            console.log("Found code in URL, trying to exchange for session");
            try {
              const { data: exchangeData, error: exchangeError } =
                await supabase.auth.exchangeCodeForSession(code);

              if (exchangeError) {
                console.error(
                  "Error exchanging code for session:",
                  exchangeError
                );
                setError(exchangeError.message);
                toast.error(
                  "Error en la autenticación: " + exchangeError.message
                );
                setTimeout(() => navigate("/auth/sign-in"), 2000);
                return;
              }

              if (exchangeData.session) {
                console.log("Session obtained through code exchange");
                toast.success("Inicio de sesión exitoso");
                navigate(redirectTo);
                return;
              }
            } catch (exchangeErr) {
              console.error("Error in code exchange:", exchangeErr);
            }
          }

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
