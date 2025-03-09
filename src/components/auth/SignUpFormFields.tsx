
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { RoleSelector } from "./RoleSelector";
import { SignUpFormData } from "@/hooks/useSignUpForm";

interface SignUpFormFieldsProps {
  formData: SignUpFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (value: "merchant" | "user") => void;
}

export function SignUpFormFields({ 
  formData, 
  handleChange, 
  handleRoleChange 
}: SignUpFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="username"
            name="username"
            placeholder="username"
            value={formData.username}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
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

      <PasswordInput 
        value={formData.password} 
        onChange={handleChange} 
      />

      <RoleSelector 
        value={formData.role} 
        onChange={handleRoleChange} 
      />
    </>
  );
}
