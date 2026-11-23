import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createLogger } from "@/utils";
import { Plus } from "lucide-react";
import { SongEditor } from "./SongEditor";
import { useInstruments, useSongs } from "@/hooks";
import { SongsTable } from "@/features/admin/components/songs/table/SongsTable";

const log = createLogger("SongsTab");

export function SongsTab() {
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isAddingSong, setIsAddingSong] = useState(false);

  const {
    data: instruments,
    isLoading: instrumentsIsLoading,
    error: instrumentsError,
  } = useInstruments();
  const {
    data: songs,
    isLoading: songsIsLoading,
    error: songsError,
  } = useSongs();

  function openEditor(songId: string | null) {
    setIsAddingSong(songId === null);
    setEditingSongId(songId);
    setEditorOpen(true);
  }

  if (instrumentsIsLoading || songsIsLoading) {
    return <div>Loading...</div>;
  }

  if (instrumentsError) {
    log.error(instrumentsError);
    return <div>Failed to load instruments.</div>;
  }

  if (songsError) {
    log.error(songsError);
    return <div>Failed to load songs.</div>;
  }

  const safeInstruments = instruments ?? [];
  const safeSongs = songs ?? [];

  return (
    <section className="mx-auto max-w-4xl rounded-lg">
      <Button
        variant="outline"
        className="mx-auto flex"
        onClick={() => openEditor(null)}
      >
        <Plus />
        Add Song
      </Button>

      <SongsTable songs={safeSongs} openEditor={openEditor} />

      {editorOpen && (
        <SongEditor
          key={editingSongId ?? "new"}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          songId={editingSongId}
          instruments={safeInstruments}
          onSongCreated={setEditingSongId}
          isAddingSong={isAddingSong}
        />
      )}
    </section>
  );
}
