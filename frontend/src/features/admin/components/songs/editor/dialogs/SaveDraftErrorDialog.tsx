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

type SaveDraftErrorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAndReload: () => void;
};

export function SaveDraftErrorDialog({
  open,
  onOpenChange,
  onCloseAndReload,
}: SaveDraftErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent overlayClassName="bg-black/40 supports-backdrop-filter:backdrop-blur-[0.5px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Save Draft failed</AlertDialogTitle>
          <AlertDialogDescription>
            Some changes may have been saved successfully. You can close the
            editor and reload the saved data, or keep editing. Retrying Save
            Draft may fail because some changes have already been saved.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Keep Editing</AlertDialogCancel>

          <AlertDialogAction onClick={onCloseAndReload}>
            Close and Reload (Recommended)
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
