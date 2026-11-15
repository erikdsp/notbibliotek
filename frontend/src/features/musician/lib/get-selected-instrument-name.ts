import type { Instrument } from "@/core/types";

export function getSelectedInstrumentName(
  selectedInstrument: string | null,
  instruments: Instrument[],
  include_unconnected_parts: boolean,
) {
  if (include_unconnected_parts === true) {
    return "Odd Parts";
  }

  return instruments.find((instrument) => instrument.key === selectedInstrument)
    ?.name;
}
