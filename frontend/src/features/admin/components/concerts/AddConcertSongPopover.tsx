import { Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Song } from "@/core/types";

type AddConcertSongPopoverProps = {
  songs: Song[];
  selectedSongIds: string[];
  onAddSong: (songId: string) => void;
  onRemoveSong: (songId: string) => void;
};

export function AddConcertSongPopover({
  songs,
  selectedSongIds,
  onAddSong,
  onRemoveSong,
}: AddConcertSongPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="secondary" size="sm" className="h-7" />}
      >
        <Plus className="size-3" />
        Add song
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 space-y-2">
        {songs.map((song) => (
          <Label
            key={song.id}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <Checkbox
              checked={selectedSongIds.includes(song.id)}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  onAddSong(song.id);
                } else {
                  onRemoveSong(song.id);
                }
              }}
            />

            {song.title}
          </Label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
