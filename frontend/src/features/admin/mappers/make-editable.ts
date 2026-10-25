import type { PartInstruments, SongResponse } from "@/core/types";
import type { EditablePart, EditableScore } from "@/features/admin/types";

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

export function makeEditableScore(
  song: SongResponse | null,
  versionId: string | null,
): EditableScore | null {
  const version = song?.versions.find(
    (version) => version.song_version_id === versionId,
  );

  if (!version?.score) return null;

  return {
    file_id: version.score.file.id,
    file_name: version.score.file.name,
    file: null,
  };
}
