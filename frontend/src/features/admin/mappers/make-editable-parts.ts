import type { PartInstruments, SongResponse } from "@/core/types";
import type { EditablePart } from "@/features/admin/types";

export function makeEditableParts(
  song: SongResponse | null,
  versionId: string | null,
  partInstruments: PartInstruments[],
): EditablePart[] {
  const version = song?.versions.find(
    (version) => version.song_version_id === versionId,
  );

  if (!version) {
    return [];
  }

  return version.parts.map((part) => {    
    const connections = partInstruments.find(
      (item) => item.part_id === part.id,
    );

    const instrumentIds =
      connections?.instruments.map((instrument) => instrument.id) ?? [];

    return {
      local_id: part.id,
      id: part.id,
      key: part.key,
      name: part.name,
      file_id: part.file.id,
      file_name: part.file.name,
      file: null,
      instrument_ids: instrumentIds,
    };
  });
}
