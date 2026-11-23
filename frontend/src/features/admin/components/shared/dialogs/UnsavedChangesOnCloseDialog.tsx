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

type UnsavedChangesOnCloseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscardAndClose: () => void;
};

export function UnsavedChangesOnCloseDialog({
  open,
  onOpenChange,
  onDiscardAndClose,
}: UnsavedChangesOnCloseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent overlayClassName="bg-black/40 supports-backdrop-filter:backdrop-blur-[0.5px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Your unsaved changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Keep Editing</AlertDialogCancel>

          <AlertDialogAction onClick={onDiscardAndClose}>
            Discard Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
