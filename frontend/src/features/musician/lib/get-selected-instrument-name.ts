import type { Instrument } from "@/core/types";

export function getSelectedInstrumentName(
  selectedInstrument: string | null,
  instruments: Instrument[],
) {
  return instruments.find((instrument) => instrument.key === selectedInstrument)
    ?.name;
}
