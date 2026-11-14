import type { SongResponse } from "@/core/types";

export function getCurrentVersion(song: SongResponse | undefined) {
  if (song === undefined) {
    return undefined;
  }
  return song.versions.find(
    (version) => version.song_version_id === song.current_version_id,
  );
}
