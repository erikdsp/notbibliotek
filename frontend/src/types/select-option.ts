export const resetValue = "__reset__";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectOptionSection = {
  sectionLabel?: string;
  options: SelectOption[];
  hideWhenNoSelection?: boolean;
};
