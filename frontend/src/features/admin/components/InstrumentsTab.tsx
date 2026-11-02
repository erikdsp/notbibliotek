import { useState } from "react";
import { InstrumentEditor } from "./InstrumentEditor";
import { Plus, Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createLogger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { useDeleteInstrument, useInstruments } from "@/hooks";
import type { EditableInstrument } from "@/features/admin/types/instrument-editor-types";
import type { Instrument } from "@/core/types";
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

const log = createLogger("InstrumentsTab");

export function InstrumentsTab() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] =
    useState<EditableInstrument | null>(null);
  const [deletingInstrument, setDeletingInstrument] =
    useState<Instrument | null>(null);
  const {
    data: instruments,
    isLoading: instrumentsIsLoading,
    error: instrumentsError,
  } = useInstruments();

  function handleEdit(instrument: Instrument) {
    setEditingInstrument(instrument);
    setEditorOpen(true);
  }

  function handleAdd() {
    setEditingInstrument(null);
    setEditorOpen(true);
  }

  const deleteInstrumentMutation = useDeleteInstrument();

  function handleDelete(instrument: Instrument) {
    deleteInstrumentMutation.reset();
    setDeletingInstrument(instrument);
  }

  async function confirmDelete() {
    if (deletingInstrument === null) return;

    try {
      await deleteInstrumentMutation.mutateAsync({
        instrumentId: deletingInstrument.id,
      });
      setDeletingInstrument(null);
    } catch (error) {
      log.error("Failed to delete instrument:", error);
    }
  }

  if (instrumentsIsLoading) {
    return <div>Loading...</div>;
  }

  if (instrumentsError) {
    log.error(instrumentsError);
    return <div>Failed to load instruments.</div>;
  }

  const safeInstruments = instruments ?? [];

  return (
    <section className="mx-auto max-w-xl rounded-lg">
      <Button variant="outline" className="mx-auto flex" onClick={handleAdd}>
        <Plus />
        Add Instrument
      </Button>
      <div className="rounded-lg border p-1 mt-4">
        <Table>
          <TableHeader className="border-b-2">
            <TableRow className="text-base">
              <TableHead className="font-normal">Name</TableHead>
              <TableHead className="font-normal">Key</TableHead>
              <TableHead className="font-normal w-2"></TableHead>
              <TableHead className="font-normal w-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeInstruments.map((instrument) => (
              <TableRow key={instrument.id}>
                <TableCell>{instrument.name}</TableCell>
                <TableCell className="italic">{instrument.key}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className={"rounded-md"}
                    onClick={() => handleEdit(instrument)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="rounded-md"
                    onClick={() => handleDelete(instrument)}
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
        <InstrumentEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          editingInstrument={editingInstrument}
          instruments={safeInstruments}
        />
      )}

      <AlertDialog
        open={deletingInstrument !== null}
        onOpenChange={(open) => {
          if (!open && !deleteInstrumentMutation.isPending) {
            setDeletingInstrument(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Instrument?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingInstrument?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteInstrumentMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              Failed to delete instrument. Tip: Remove any connections to this instrument in parts before trying again.
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteInstrumentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteInstrumentMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleteInstrumentMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
