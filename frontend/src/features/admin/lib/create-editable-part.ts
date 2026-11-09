import type { Instrument } from "@/core/types";
import { defaultInstrumentMappings } from "@/features/admin/lib/default-instrument-mappings";
import { nameToKey } from "@/features/admin/lib/name-to-key";
import { suggestPartName } from "@/features/admin/lib/suggest-part-name";
import { createLocalId } from "@/features/admin/utils/create-local-id";

export function createEditablePart(file: File, instruments: Instrument[]) {
  const name = suggestPartName(file.name);
  const key = nameToKey(name, new Set());
  const instrumentKeys = defaultInstrumentMappings[key] ?? [];
  const instrumentIds = instruments
    .filter((instrument) => instrumentKeys.includes(instrument.key))
    .map((instrument) => instrument.id);

  return {
    local_id: createLocalId(),
    id: null,
    key,
    name,
    file_id: null,
    file_name: file.name,
    file,
    instrument_ids: instrumentIds,
  };
}
