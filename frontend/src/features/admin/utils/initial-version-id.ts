import type { SongResponse } from "@/core/types";

// Selects the first unpublished draft, or the current published version if no draft exists.
export function initialVersionId(song: SongResponse | null) {
  if (!song) return null;

  const draft = song.versions.find((version) => version.published_at === null);

  return draft?.song_version_id ?? song.current_version_id;
}