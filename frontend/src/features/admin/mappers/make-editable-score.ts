import type { SongResponse } from "@/core/types";
import type { EditableScore } from "@/features/admin/types";

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
