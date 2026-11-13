import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectOptionSection } from "@/types";
import { Fragment } from "react";

type GroupedSelectProps = {
  options: SelectOptionSection[];
  onSelect: (value: string | null) => void;
  value: string | null;
  placeholder: string;
  className?: string;
};

export function GroupedSelect({
  options,
  onSelect,
  value,
  placeholder,
  className,
}: GroupedSelectProps) {
  const optionSelected = value !== null;
  const visibleSections = options.filter(
    (section) => !section.hideWhenNoSelection || optionSelected,
  );

  const items = options.flatMap((section) => section.options);

  return (
    <Select items={items} value={value} onValueChange={onSelect}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {visibleSections.map((section, index) => (
          <Fragment key={section.sectionLabel ?? index}>
            {index > 0 && <SelectSeparator />}
            <SelectGroup>
              {section.sectionLabel && (
                <SelectLabel>{section.sectionLabel}</SelectLabel>
              )}
              {section.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </Fragment>
        ))}
      </SelectContent>
    </Select>
  );
}
