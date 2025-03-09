import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpFormFields } from "@/components/auth/SignUpFormFields";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SignUp = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, isLoading: authLoading } = useSupabaseAuth();
  const { formData, isLoading, handleChange, handleRoleChange, handleSubmit } =
    useSignUpForm();

  const handleGoogleSignIn = async () => {
    try {
      // Store the intended redirect destination
      localStorage.setItem("authRedirectTo", "/profile");
      await signInWithGoogle(formData.role);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Error al iniciar sesión con Google");
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-6 w-full max-w-md fade-in">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold">Regístrate Gratis</h1>
          <p className="text-muted-foreground mt-2">
            Regístrate rápidamente para comenzar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SignUpFormFields
            formData={formData}
            handleChange={handleChange}
            handleRoleChange={handleRoleChange}
          />

          <SubmitButton
            isLoading={isLoading}
            text="Registrarse"
            loadingText="Creando cuenta..."
          />
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
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/auth/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
