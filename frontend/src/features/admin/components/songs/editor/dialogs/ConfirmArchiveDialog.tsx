import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmArchiveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isArchived: boolean;
  onConfirm: () => void;
  isArchiving: boolean;
  archiveError: boolean;
};

export function ConfirmArchiveDialog({
  open,
  onOpenChange,
  isArchived,
  onConfirm,
  isArchiving,
  archiveError,
}: ConfirmArchiveDialogProps) {
  const title = !isArchived ? "Archive Song?" : "Unarchive Song?";

  const description = !isArchived
    ? `The song will be removed from view except in concerts where it is already present.
        It can be un-archived again later if you change your mind.`
    : `This will make the song appear in the library view again`;

 const confirmButtonLabel = isArchiving
  ? isArchived
    ? "Unarchiving..."
    : "Archiving..."
  : isArchived
    ? "Unarchive Song"
    : "Archive Song";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-[95vw] sm:max-w-xl flex-col overflow-hidden"
        overlayClassName="bg-black/20 supports-backdrop-filter:backdrop-blur-[0px]"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
              {description}
          
          </DialogDescription>
          {archiveError && (
            <p role="alert" className="text-sm text-destructive">
              Failed to archive song. Please try again.
            </p>
          )}
        </DialogHeader>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isArchiving} onClick={onConfirm}>
            {confirmButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
