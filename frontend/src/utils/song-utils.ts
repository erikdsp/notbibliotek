import type { SongResponse } from "@/core/types";
import { formatDateTime } from "./format-time";

export function formatSongVersion(song: SongResponse, versionId: string | null): string | null {
    if (versionId === null) return null;

    const publishedAt =
      song.versions.find(
        (version) => version.song_version_id === versionId,
      )?.published_at ?? null;

    return formatDateTime(publishedAt);
  }
