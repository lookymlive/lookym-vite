
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PasswordInput({ value, onChange }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className="pl-10"
          required
          minLength={8}
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
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
        <div
          className={`h-full ${
            value.length === 0
              ? "w-0"
              : value.length < 6
              ? "w-1/4 bg-red-500"
              : value.length < 8
              ? "w-2/4 bg-yellow-500"
              : value.length < 10
              ? "w-3/4 bg-blue-500"
              : "w-full bg-green-500"
          } transition-all duration-300`}
        ></div>
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: {value.length === 0
          ? "None"
          : value.length < 6
          ? "Weak"
          : value.length < 8
          ? "Fair"
          : value.length < 10
          ? "Good"
          : "Strong"}
      </p>
    </div>
  );
}
