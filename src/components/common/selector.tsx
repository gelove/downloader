import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

export interface SelectorOption extends Option {}

export type SelectorProps = {
  label?: string;
  className?: string;
  placeholder?: string;
  options: Array<SelectorOption>;
};

export function Selector(props: SelectorProps) {
  const { label, className, placeholder, options } = props;
  return (
    <Select>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder={placeholder || "Select a item"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {label && <SelectLabel>{label}</SelectLabel>}
          {options.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
