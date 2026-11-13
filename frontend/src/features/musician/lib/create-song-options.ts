import type { SongResponse } from "@/core/types";
import { resetValue, type SelectOptionSection } from "@/types/select-option";

export function createSongOptions(
  songs: SongResponse[],
): SelectOptionSection[] {
    
  const result: SelectOptionSection[] = [
    {
      options: [{ label: "Reset song selection", value: resetValue }],
      hideWhenNoSelection: true,
    },
    { options: [] },
  ];

  for (const song of songs) {
    result[1].options.push({
      label: song.title,
      value: song.id,
    });
  }

  return result;
}
