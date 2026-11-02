import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { ConcertDetailedResponse, Song } from "@/core/types";
import { createLogger } from "@/utils/logger";
import type { EditableConcert } from "@/features/admin/types/concert-editor-types";
import { makeEditableConcert } from "@/features/admin/mappers/make-editable-concert";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateConcert, useUpdateConcert } from "@/hooks";
import {
  createConcertSongConnection,
  deleteConcertSongConnection,
} from "@/services/concert-songs-service";
import { useQueryClient } from "@tanstack/react-query";
import { nameToKey } from "@/features/admin/lib/name-to-key";

const log = createLogger("ConcertEditor");

type ConcertEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingConcert: ConcertDetailedResponse | null;
  songs: Song[];
  concerts: ConcertDetailedResponse[];
};

export function ConcertEditor({
  open,
  onOpenChange,
  editingConcert,
  songs,
  concerts,
}: ConcertEditorProps) {
  const [editedConcert, setEditedConcert] = useState<EditableConcert>(
    makeEditableConcert(editingConcert),
  );
  const isEditing = editingConcert !== null;
  const concertKeys = new Set(concerts.map((c) => c.key));

  const originalConcert = makeEditableConcert(editingConcert);

  const originalSongIds = new Set(originalConcert.song_ids);
  const currentSongIds = new Set(editedConcert.song_ids);

  const songsChanged =
    originalSongIds.size !== currentSongIds.size ||
    [...currentSongIds].some((id) => !originalSongIds.has(id));

  const isDirty =
    editedConcert.name.trim() !== originalConcert.name ||
    editedConcert.date !== originalConcert.date ||
    songsChanged;

  const isValid =
    editedConcert.name.trim().length > 0 &&
    editedConcert.date.trim().length > 0;

  function updateConcert(update: Partial<EditableConcert>) {
    setEditedConcert((current) => ({
      ...current,
      ...update,
    }));
  }

  function toggleSong(songId: string) {
    const songIds = editedConcert.song_ids.includes(songId)
      ? editedConcert.song_ids.filter((id) => id !== songId)
      : [...editedConcert.song_ids, songId];

    updateConcert({ song_ids: songIds });
  }

  const queryClient = useQueryClient();
  const createConcertMutation = useCreateConcert();
  const updateConcertMutation = useUpdateConcert();

  async function saveSongConnections(
    concertId: string,
    originalSongIds: string[],
  ) {
    const originalIds = new Set(originalSongIds);
    const editedIds = new Set(editedConcert.song_ids);

    const addedIds = [...editedIds].filter((id) => !originalIds.has(id));
    const removedIds = [...originalIds].filter((id) => !editedIds.has(id));

    await Promise.all([
      ...addedIds.map((songId) =>
        createConcertSongConnection(concertId, songId),
      ),
      ...removedIds.map((songId) =>
        deleteConcertSongConnection(concertId, songId),
      ),
    ]);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isDirty || !isValid) return;

    const name = editedConcert.name.trim();
    const date = editedConcert.date;

    if (!isEditing) {
      try {
        const createdConcert = await createConcertMutation.mutateAsync({
          name,
          date,
          key: nameToKey(`${name}${date.slice(0, 4)}`, concertKeys),
        });

        await saveSongConnections(createdConcert.id, []);
        await queryClient.invalidateQueries({ queryKey: ["concerts"] });
      } catch (error) {
        log.error("Failed to create concert:", error);
        return;
      }
    } else {
      const newName = name !== editingConcert.name ? name : undefined;

      const newDate = date !== editingConcert.date ? date : undefined;

      try {
        if (newName !== undefined || newDate !== undefined) {
          await updateConcertMutation.mutateAsync({
            concertId: editingConcert.id,
            name: newName,
            date: newDate,
          });
        }

        if (songsChanged) {
          await saveSongConnections(
            editingConcert.id,
            editingConcert.songs.map((song) => song.id),
          );
        }

        await queryClient.invalidateQueries({ queryKey: ["concerts"] });
      } catch (error) {
        log.error("Failed to update concert:", error);
        return;
      }
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Concert" : "Add Concert"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? "Edit an existing concert" : "Add a new concert"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                value={editedConcert.name}
                placeholder="Concert name"
                onChange={(event) =>
                  updateConcert({ name: event.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="name">Date</FieldLabel>
              <Input
                id="date"
                type="date"
                value={editedConcert.date}
                onChange={(event) =>
                  updateConcert({ date: event.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Songs</FieldLabel>

              <div className="flex flex-col items-start gap-2 rounded-md border p-2">
                {editedConcert.song_ids.map((id) => {
                  const song = songs.find((song) => song.id === id);

                  if (!song) return null;

                  return (
                    <Badge
                      key={id}
                      variant="ghost"
                      className="flex w-full justify-between gap-2 py-1"
                    >
                      <span>{song.title}</span>

                      <button
                        type="button"
                        aria-label={`Remove ${song.title}`}
                        onClick={() => toggleSong(id)}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  );
                })}

                <Popover>
                  <PopoverTrigger
                    render={
                      <Button variant="secondary" size="sm" className="h-7" />
                    }
                  >
                    <Plus className="size-3" />
                    Add song
                  </PopoverTrigger>

                  <PopoverContent align="start" className="w-64 space-y-2">
                    {songs.map((song) => (
                      <label
                        key={song.id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={editedConcert.song_ids.includes(song.id)}
                          onCheckedChange={() => toggleSong(song.id)}
                        />

                        {song.title}
                      </label>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            </Field>
          </FieldGroup>

          {(createConcertMutation.isError || updateConcertMutation.isError) && (
            <p role="alert" className="text-sm text-destructive pb-4">
              Failed to save concert. Please try again.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !isDirty ||
                !isValid ||
                createConcertMutation.isPending ||
                updateConcertMutation.isPending
              }
            >
              {isEditing ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
