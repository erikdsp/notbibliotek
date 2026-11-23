import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createLogger } from "@/utils";
import { Plus } from "lucide-react";
import { SongEditor } from "./SongEditor";
import { useInstruments, useSongs } from "@/hooks";
import { SongsTable } from "@/features/admin/components/songs/table/SongsTable";
import type { SongFilters } from "@/services/songs-service";

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

  const songFilters: SongFilters = {
    include_archived: true,
  };
  const {
    data: songs,
    isLoading: songsIsLoading,
    error: songsError,
  } = useSongs(songFilters);

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
  const activeSongs = safeSongs.filter(
    (song) => song.archived_at === null,
  );
  const archivedSongs = safeSongs.filter((song) => song.archived_at !== null);

  return (
    <section className="mx-auto max-w-3xl rounded-lg">
      <Button
        variant="outline"
        className="mx-auto flex"
        onClick={() => openEditor(null)}
      >
        <Plus />
        Add Song
      </Button>

      <SongsTable songs={activeSongs} openEditor={openEditor} />

      {archivedSongs.length > 0 && (
        <>
          <h3 className="ml-4 mt-12 mb-2 text-base font-normal ">
            Archived Songs
          </h3>
          <SongsTable songs={archivedSongs} openEditor={openEditor} />
        </>
      )}

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
