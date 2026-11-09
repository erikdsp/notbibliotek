import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Song } from "@/core/types";

type SelectedConcertSongsProps = {
  selectedSongIds: string[];
  songs: Song[];
  onRemoveSong: (songId: string) => void;
};

export function SelectedConcertSongs({
  selectedSongIds,
  songs,
  onRemoveSong,
}: SelectedConcertSongsProps) {
  return selectedSongIds.map((id) => {
    const song = songs.find((song) => song.id === id);

    if (!song) return null;

    return (
      <Badge
        key={id}
        variant="ghost"
        className="flex w-full justify-between gap-2 py-1"
      >
        <span>{song.title}</span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-auto p-0"
          aria-label={`Remove ${song.title}`}
          onClick={() => onRemoveSong(id)}
        >
          <X className="size-3" />
        </Button>
      </Badge>
    );
  });
}
