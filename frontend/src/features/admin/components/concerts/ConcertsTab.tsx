import { Button } from "@/components/ui/button";
import type { ConcertDetailedResponse } from "@/core/types";
import { ConcertEditor } from "./ConcertEditor";
import { useConcerts, useDeleteConcert, useSongs } from "@/hooks";
import { createLogger } from "@/utils/logger";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DeleteConcertDialog } from "@/features/admin/components/concerts/DeleteConcertDialog";
import { ConcertsTable } from "@/features/admin/components/concerts/ConcertsTable";

const log = createLogger("ConcertsTab");

export function ConcertsTab() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingConcert, setEditingConcert] =
    useState<ConcertDetailedResponse | null>(null);
  const [deletingConcert, setDeletingConcert] =
    useState<ConcertDetailedResponse | null>(null);
  const {
    data: concerts,
    isLoading: concertsIsLoading,
    error: concertsError,
  } = useConcerts();

  const {
    data: songs,
    isLoading: songsIsLoading,
    error: songsError,
  } = useSongs();

  function handleAdd() {
    setEditingConcert(null);
    setEditorOpen(true);
  }

  function handleEdit(concert: ConcertDetailedResponse) {
    setEditingConcert(concert);
    setEditorOpen(true);
  }

  const queryClient = useQueryClient();
  const deleteConcertMutation = useDeleteConcert();

  function handleDelete(concert: ConcertDetailedResponse) {
    deleteConcertMutation.reset();
    setDeletingConcert(concert);
  }

  async function confirmDelete() {
    if (deletingConcert === null) return;

    try {
      await deleteConcertMutation.mutateAsync({
        concertId: deletingConcert.id,
      });
      await queryClient.invalidateQueries({ queryKey: ["concerts"] });
      setDeletingConcert(null);
    } catch (error) {
      log.error("Failed to delete concert:", error);
    }
  }

  function handleDeleteConcertOpenChange(open: boolean) {
    if (!open && !deleteConcertMutation.isPending) {
      setDeletingConcert(null);
    }
  }

  if (concertsIsLoading || songsIsLoading) {
    return <div>Loading...</div>;
  }

  if (concertsError) {
    log.error(concertsError);
    return <div>Failed to load concerts.</div>;
  }

  if (songsError) {
    log.error(songsError);
    return <div>Failed to load songs.</div>;
  }

  const safeConcerts = concerts ?? [];
  const safeSongs = songs ?? [];
  const deletingSongCount = deletingConcert?.songs.length ?? 0;

  return (
    <section className="mx-auto max-w-4xl rounded-lg">
      <Button variant="outline" className="mx-auto flex" onClick={handleAdd}>
        <Plus />
        Add Concert
      </Button>

      <ConcertsTable
        concerts={safeConcerts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editorOpen && (
        <ConcertEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          editingConcert={editingConcert}
          concerts={safeConcerts}
          songs={safeSongs}
        />
      )}

      <DeleteConcertDialog
        concert={deletingConcert}
        songCount={deletingSongCount}
        isDeleting={deleteConcertMutation.isPending}
        deleteError={deleteConcertMutation.isError}
        onOpenChange={handleDeleteConcertOpenChange}
        onConfirmDelete={confirmDelete}
      />
    </section>
  );
}
