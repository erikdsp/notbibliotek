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
import type { Instrument } from "@/core/types";

type DeleteInstrumentDialogProps = {
  instrument: Instrument | null;
  isDeleting: boolean;
  deleteError: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void | Promise<void>;
};

export function DeleteInstrumentDialog({
  instrument,
  isDeleting,
  deleteError,
  onOpenChange,
  onConfirmDelete,
}: DeleteInstrumentDialogProps) {
  if (instrument === null) return null;

  function handleConfirmDelete(event: React.MouseEvent) {
    event.preventDefault();
    void onConfirmDelete();
  }

  return (
    <AlertDialog open={instrument !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Instrument?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{instrument.name}</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteError && (
          <p role="alert" className="text-sm text-destructive">
            Failed to delete instrument. Tip: Remove any connections to this
            instrument in parts before trying again.
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
