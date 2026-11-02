import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ConcertDetailedResponse } from "@/core/types";
import { ConcertEditor } from "@/features/admin/components/ConcertEditor";
import { useConcerts, useDeleteConcert, useSongs } from "@/hooks";
import { createLogger } from "@/utils/logger";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Pencil, Plus, Trash } from "lucide-react";
import { useState } from "react";

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

      <div className="rounded-lg border p-1 mt-4 ">
        <Table>
          <TableHeader className="border-b-2">
            <TableRow className="text-base">
              <TableHead className="font-normal">Name</TableHead>
              <TableHead className="font-normal">Date</TableHead>
              <TableHead className="font-normal w-50">Songs</TableHead>
              <TableHead className="font-normal w-2"></TableHead>
              <TableHead className="font-normal w-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeConcerts.map((concert) => (
              <TableRow key={concert.id}>
                <TableCell>{concert.name}</TableCell>
                <TableCell>{concert.date}</TableCell>
                <TableCell>
                  {" "}
                  <ChevronDown className="ml-2 size-5" />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className={"rounded-md"}
                    onClick={() => handleEdit(concert)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="rounded-md"
                    onClick={() => handleDelete(concert)}
                  >
                    <Trash className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editorOpen && (
        <ConcertEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          editingConcert={editingConcert}
          concerts={safeConcerts}
          songs={safeSongs}
        />
      )}

      <AlertDialog
        open={deletingConcert !== null}
        onOpenChange={(open) => {
          if (!open && !deleteConcertMutation.isPending) {
            setDeletingConcert(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Concert?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                Are you sure you want to delete this concert?
              </span>

              <span className="block rounded-md border p-3">
                <strong className="block text-foreground">
                  {deletingConcert?.name}
                </strong>
                <span className="block text-sm">{deletingConcert?.date}</span>
              </span>

              <span className="block">
                The concert and its setlist with {deletingSongCount} song
                {deletingSongCount !== 1 && "s"} will be deleted <br/> (All songs will remain in the library)
              </span>

              <span className="block">

              </span>
              <strong className="block text-destructive">
                This action cannot be undone
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteConcertMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              Failed to delete concert. Please hope for the best and try again.
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConcertMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteConcertMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleteConcertMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
