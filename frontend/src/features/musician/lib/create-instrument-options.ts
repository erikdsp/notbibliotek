import type { Instrument } from "@/core/types";
import { oddPartsValue } from "@/features/musician/constants/select-options";
import { resetValue, type SelectOptionSection } from "@/types/select-option";

export function createInstrumentOptions(
  instruments: Instrument[],
): SelectOptionSection[] {
  
  const result: SelectOptionSection[] = [
    {
      options: [{ label: "Reset instrument selection", value: resetValue }],
      hideWhenNoSelection: true,
    },
    { options: [] },
    { options: [{ label: "Odd Parts", value: oddPartsValue }] },
  ];

  for (const instrument of instruments) {
    result[1].options.push({
      label: instrument.name,
      value: instrument.key,
    });
  }

  return result;
}
