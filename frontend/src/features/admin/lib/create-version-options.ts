import type { SongResponse } from "@/core/types";
import type { SelectOption } from "@/types/select-option";
import { formatSongVersion } from "@/utils/song-utils";

export function createVersionOptions(
  song: SongResponse | null,
): SelectOption[] {
  if (song === null) return [];

  return song.versions.map((version) => {
    const label = formatSongVersion(song, version.song_version_id) ?? "Draft";
    const isCurrent = version.song_version_id === song.current_version_id;

    return {
      value: version.song_version_id,
      label: isCurrent ? `${label} (Current)` : label,
    };
  });
}
