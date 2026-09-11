import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  otherValue: string;
  onValueChange: (value: string) => void;
  onOtherValueChange: (value: string) => void;
  placeholder?: string;
  otherPlaceholder?: string;
  required?: boolean;
};

const OTHER_VALUE = "__outro__";

export function OtherSelect({
  label,
  options,
  value,
  otherValue,
  onValueChange,
  onOtherValueChange,
  placeholder = "Selecione",
  otherPlaceholder = "Especifique",
  required,
}: Props) {
  const id = useId();
  const isOther = value === OTHER_VALUE;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
          <SelectItem value={OTHER_VALUE}>Outro</SelectItem>
        </SelectContent>
      </Select>
      {isOther && (
        <Input
          value={otherValue}
          onChange={(e) => onOtherValueChange(e.target.value)}
          placeholder={otherPlaceholder}
          required={required}
          className="mt-1.5"
        />
      )}
    </div>
  );
}

export { OTHER_VALUE };

export function resolveOtherValue(value: string, otherValue: string): string {
  return value === OTHER_VALUE ? otherValue : value;
}

export function splitOtherValue(stored: string, options: string[]): { value: string; otherValue: string } {
  if (options.includes(stored)) return { value: stored, otherValue: "" };
  if (stored) return { value: OTHER_VALUE, otherValue: stored };
  return { value: "", otherValue: "" };
}
