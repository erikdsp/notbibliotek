import type { SongResponse } from "@/core/types";
import type { EditablePart, EditableScore } from "@/features/admin/types";

export function makeEditableParts(
  song: SongResponse | null,
  versionId: string | null,
): EditablePart[] {
  const version = song?.versions.find(
    (version) => version.song_version_id === versionId,
  );

  return (
    version?.parts.map((part) => ({
      local_id: part.id,
      id: part.id,
      key: part.key,
      name: part.name,
      file_id: part.file_id,
      file_name: "Dummy Name",
      file: null,
      instrument_ids: [],
    })) ?? []
  );
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
    file_id: version.score.file_id,
    file_name: "Dummy Name",
    file: null,
  };
}