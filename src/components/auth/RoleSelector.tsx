
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RoleSelectorProps {
  value: "merchant" | "user";
  onChange: (value: "merchant" | "user") => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled = false }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Account Type</Label>
      <RadioGroup 
        value={value} 
        onValueChange={(value) => onChange(value as "merchant" | "user")}
        className="flex flex-col sm:flex-row gap-4"
        disabled={disabled}
      >
        <div className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-colors ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:border-primary'}`}>
          <RadioGroupItem value="user" id="user" disabled={disabled} />
          <Label htmlFor="user" className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Regular User (watch & comment)</Label>
        </div>
        <div className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-colors ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:border-primary'}`}>
          <RadioGroupItem value="merchant" id="merchant" disabled={disabled} />
          <Label htmlFor="merchant" className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Merchant (upload videos)</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
