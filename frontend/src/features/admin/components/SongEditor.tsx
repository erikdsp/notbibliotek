import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Instrument } from "@/core/types";
import { SongEditorForm } from "@/features/admin/components/SongEditorForm";

import { useSong } from "@/hooks";
import { createLogger } from "@/utils/logger";

const log = createLogger("SongEditor");

type SongEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId: string | null;
  instruments: Instrument[];
  onSongCreated: (songId: string) => void;
  isAddingSong: boolean;
};

export function SongEditor({
  open,
  onOpenChange,
  songId,
  instruments,
  onSongCreated,
  isAddingSong,
}: SongEditorProps) {
  const { data: song, isPending, error } = useSong(songId);

  if (!open) return null;

  if (songId !== null && (isPending || error)) {
    if (error) {
      log.error(error);
    }
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          {isPending ? "Loading..." : "Failed to load song."}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <SongEditorForm
      open={open}
      song={song ?? null}
      instruments={instruments}
      onOpenChange={onOpenChange}
      onSongCreated={onSongCreated}
      isAddingSong={isAddingSong}
    />
  );
}
