
import { useState } from "react";
import { toast } from "sonner";

type UserRole = "merchant" | "user";

export interface SignUpFormData {
  email: string;
  username: string;
  password: string;
  role: UserRole;
}

export function useSignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    username: "",
    password: "",
    role: "user",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: UserRole) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      toast.error("El registro con correo/contraseña no está implementado aún");
    } catch (error) {
      console.error("Error de registro:", error);
      toast.error("Error al crear la cuenta. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleChange,
    handleRoleChange,
    handleSubmit,
  };
}
