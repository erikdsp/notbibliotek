import type { SongResponse } from "@/core/types";

export function initialVersionId(song: SongResponse | null) {
  if (!song) return null;

  const latestDraft = song.versions.find((version) => version.published_at === null);

  return latestDraft?.song_version_id ?? song.current_version_id;
}