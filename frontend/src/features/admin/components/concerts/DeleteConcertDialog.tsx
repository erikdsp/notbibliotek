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
import type { ConcertResponse } from "@/core/types";

type DeleteConcertDialogProps = {
  concert: ConcertResponse | null;
  songCount: number;
  isDeleting: boolean;
  deleteError: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void | Promise<void>;
};

export function DeleteConcertDialog({
  concert,
  songCount,
  isDeleting,
  deleteError,
  onOpenChange,
  onConfirmDelete,
}: DeleteConcertDialogProps) {
  if (concert === null) return null;

  return (
    <AlertDialog open={concert !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Concert?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span className="block">
              Are you sure you want to delete this concert?
            </span>

            <span className="block rounded-md border p-3">
              <strong className="block text-foreground">{concert?.name}</strong>
              <span className="block text-sm">{concert.date}</span>
            </span>

            <span className="block">
              The concert and its setlist with {songCount} song
              {songCount !== 1 && "s"} will be deleted <br /> (All songs will
              remain in the library)
            </span>

            <span className="block"></span>
            <strong className="block text-destructive">
              This action cannot be undone
            </strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteError && (
          <p role="alert" className="text-sm text-destructive">
            Failed to delete concert. Please hope for the best and try again.
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              void onConfirmDelete();
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
