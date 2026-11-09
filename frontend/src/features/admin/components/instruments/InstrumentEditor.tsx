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
import type { EditableInstrument } from "@/features/admin/types/instrument-editor-types";
import type { Instrument } from "@/core/types";
import { useCreateInstrument, useUpdateInstrument } from "@/hooks";
import { createLogger } from "@/utils/logger";
import { nameToKey } from "@/features/admin/lib/name-to-key";
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

const log = createLogger("InstrumentEditor");

type InstrumentEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingInstrument: EditableInstrument | null;
  instruments: Instrument[];
};

export function InstrumentEditor({
  open,
  onOpenChange,
  editingInstrument,
  instruments,
}: InstrumentEditorProps) {
  const originalName = editingInstrument?.name ?? "";
  const [name, setName] = useState(originalName);
  const isEditing = editingInstrument !== null;
  const instrumentKeys = new Set(instruments.map((i) => i.key));
  const isDirty = name.trim() !== originalName;
  const isValid = name.trim().length > 0;
  const [duplicateWarningOpen, setDuplicateWarningOpen] = useState(false);

  const duplicateInstrument = instruments.find(
    (instrument) =>
      instrument.id !== editingInstrument?.id &&
      instrument.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );

  function handleSetName(newName: string) {
    setName(newName);
  }

  const createInstrumentMutation = useCreateInstrument();
  const updateInstrumentMutation = useUpdateInstrument();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isDirty || !isValid) return;

    if (duplicateInstrument) {
      setDuplicateWarningOpen(true);
      return;
    }

    await saveInstrument();
  }

  async function saveInstrument() {
    if (!isDirty || !isValid) return;

    if (!isEditing) {
      try {
        await createInstrumentMutation.mutateAsync({
          name: name.trim(),
          key: nameToKey(name.trim(), instrumentKeys),
        });
      } catch (error) {
        log.error("Failed to create instrument:", error);
        return;
      }
    } else {
      if (editingInstrument.id === null) return;

      const newName =
        name.trim() !== editingInstrument.name ? name.trim() : undefined;

      try {
        await updateInstrumentMutation.mutateAsync({
          instrumentId: editingInstrument.id,
          name: newName,
        });
      } catch (error) {
        log.error("Failed to update instrument:", error);
        return;
      }
    }

    setDuplicateWarningOpen(false);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Instrument" : "Add Instrument"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isEditing
                ? "Edit an existing instrument"
                : "Add a new instrument"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  placeholder="Instrument name"
                  onChange={(event) => handleSetName(event.target.value)}
                />
              </Field>
            </FieldGroup>

            {(createInstrumentMutation.isError ||
              updateInstrumentMutation.isError) && (
              <p role="alert" className="text-sm text-destructive pb-4">
                Failed to save instrument. Please try again.
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
                  createInstrumentMutation.isPending ||
                  updateInstrumentMutation.isPending
                }
              >
                {isEditing ? "Save Changes" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={duplicateWarningOpen}
        onOpenChange={setDuplicateWarningOpen}
      >
        <AlertDialogContent overlayClassName="bg-black/20 supports-backdrop-filter:backdrop-blur-[0.5px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Instrument Name</AlertDialogTitle>
            <AlertDialogDescription>
              An instrument named "{duplicateInstrument?.name}" already exists
              in the library. Do you want to continue anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={saveInstrument}
              disabled={
                createInstrumentMutation.isPending ||
                updateInstrumentMutation.isPending
              }
            >
              Save Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
