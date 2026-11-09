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
import { useCreateConcert, useUpdateConcert } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { nameToKey } from "@/features/admin/lib/name-to-key";
import { AddConcertSongPopover } from "@/features/admin/components/concerts/AddConcertSongPopover";
import { SelectedConcertSongs } from "@/features/admin/components/concerts/SelectedConcertSongs";
import { saveSongConnections } from "@/features/admin/services";

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

  function addSong(songId: string) {
    if (editedConcert.song_ids.includes(songId)) return;

    updateConcert({
      song_ids: [...editedConcert.song_ids, songId],
    });
  }

  function removeSong(songId: string) {
    updateConcert({
      song_ids: editedConcert.song_ids.filter((id) => id !== songId),
    });
  }

  const queryClient = useQueryClient();
  const createConcertMutation = useCreateConcert();
  const updateConcertMutation = useUpdateConcert();

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

        await saveSongConnections(
          createdConcert.id,
          [],
          editedConcert.song_ids,
        );
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
            editedConcert.song_ids,
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
                <SelectedConcertSongs
                  selectedSongIds={editedConcert.song_ids}
                  songs={songs}
                  onRemoveSong={removeSong}
                />

                <AddConcertSongPopover
                  songs={songs}
                  selectedSongIds={editedConcert.song_ids}
                  onAddSong={addSong}
                  onRemoveSong={removeSong}
                />
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
