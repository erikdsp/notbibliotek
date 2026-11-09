import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createLogger, formatSongVersion } from "@/utils";
import { Pencil, Plus } from "lucide-react";
import { SongEditor } from "./SongEditor";
import { useInstruments, useSongs } from "@/hooks";


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

      <div className="mt-4 rounded-lg border p-1">
        <Table>
          <TableHeader className="border-b-2">
            <TableRow className="text-base">
              <TableHead className="font-normal">Title</TableHead>
              <TableHead className="font-normal">Current Version</TableHead>
              <TableHead className="font-normal w-20 text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {safeSongs.map((song) => (
              <TableRow key={song.id}>
                <TableCell className="font-medium">{song.title}</TableCell>
                <TableCell>
                  {formatSongVersion(song, song.current_version_id) ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${song.title}`}
                    onClick={() => openEditor(song.id)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
