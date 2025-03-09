import { AuthLayout } from "@/components/auth/AuthLayout";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SignIn = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, isLoading: authLoading } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"merchant" | "user">("user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      toast.error(
        "El inicio de sesión con correo/contraseña no está implementado aún"
      );
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      toast.error(
        "Error al iniciar sesión. Por favor verifica tus credenciales."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Store the intended redirect destination
      localStorage.setItem("authRedirectTo", "/profile");
      await signInWithGoogle(role);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Error al iniciar sesión con Google");
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-6 w-full max-w-md fade-in">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
          <p className="text-muted-foreground mt-2">
            ¡Bienvenido de nuevo! Inicia sesión para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <RoleSelector value={role} onChange={setRole} />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Iniciando sesión...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Iniciar Sesión
              </span>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O continuar con
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SocialLoginButton
            provider="Google"
            onClick={handleGoogleSignIn}
            disabled={isLoading || authLoading}
          />
        </div>

        <p className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/auth/sign-up"
            className="text-primary hover:underline font-medium"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
