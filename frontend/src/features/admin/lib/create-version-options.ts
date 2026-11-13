import type { SongResponse } from "@/core/types";
import type { SelectOptionSection } from "@/types/select-option";
import { formatDateTime } from "@/utils";

export function createVersionOptions(
  song: SongResponse | null,
): SelectOptionSection[] {
  if (song === null) return [];

  const result: SelectOptionSection[] = [
    { sectionLabel: "Drafts", options: [] },
    { sectionLabel: "Published Versions", options: [] },
  ];

  for (const version of song.versions) {
    const publishedAt = version.published_at;
    const isPublished = publishedAt !== null;
    const isCurrent = version.song_version_id === song.current_version_id;
    const dateTime = isPublished
      ? formatDateTime(publishedAt)
      : formatDateTime(version.created_at);
      if (isPublished) {
        result[1].options.push({
          value: version.song_version_id,
          label: isCurrent ? `${dateTime} (Current)` : dateTime
        })
      } else {
        result[0].options.push({
          value: version.song_version_id,
          label: `${dateTime} (Draft)`
        }
        )
      }
  }
  return result;

}
