import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Instrument } from "@/core/types";
import { SongVersionEditor } from "@/features/admin/components/SongVersionEditor";

import { useSong } from "@/hooks";
import { createLogger } from "@/utils/logger";

const log = createLogger("SongEditor");

type SongEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId: string | null;
  instruments: Instrument[];
  onSongCreated: (songId: string) => void;
};

export function SongEditor({
  open,
  onOpenChange,
  songId,
  instruments,
  onSongCreated,
}: SongEditorProps) {
  const { data: song, isPending, error } = useSong(songId);

  if (!open) return null;

  if (songId !== null && (isPending || error)) {
    log.error(error);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          {isPending ? "Loading..." : "Failed to load song."}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <SongVersionEditor
      open={open}
      song={song ?? null}
      instruments={instruments}
      onOpenChange={onOpenChange}
      onSongCreated={onSongCreated}
    />
  );
}
