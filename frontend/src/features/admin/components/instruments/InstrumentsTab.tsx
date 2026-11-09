import { useState } from "react";
import { InstrumentEditor } from "./InstrumentEditor";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createLogger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { useDeleteInstrument, useInstruments } from "@/hooks";
import type { EditableInstrument } from "@/features/admin/types/instrument-editor-types";
import type { Instrument } from "@/core/types";
import { DeleteInstrumentDialog } from "@/features/admin/components/instruments/DeleteInstrumentDialog";
import { InstrumentRow } from "@/features/admin/components/instruments/InstrumentRow";

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

  function handleDeleteInstrumentOpenChange(open: boolean) {
    if (!open && !deleteInstrumentMutation.isPending) {
      setDeletingInstrument(null);
    }
  }

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
    <section className="mx-auto max-w-md rounded-lg">
      <Button variant="outline" className="mx-auto flex" onClick={handleAdd}>
        <Plus />
        Add Instrument
      </Button>

      <div className="rounded-lg border p-1 mt-4">
        <Table>
          <TableHeader className="border-b-2">
            <TableRow className="text-base">
              <TableHead className="font-normal">Name</TableHead>
              <TableHead className="font-normal w-2"></TableHead>
              <TableHead className="font-normal w-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeInstruments.map((instrument) => (
              <InstrumentRow
                key={instrument.id}
                instrument={instrument}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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

      <DeleteInstrumentDialog
        instrument={deletingInstrument}
        isDeleting={deleteInstrumentMutation.isPending}
        deleteError={deleteInstrumentMutation.isError}
        onOpenChange={handleDeleteInstrumentOpenChange}
        onConfirmDelete={confirmDelete}
      />
    </section>
  );
}
