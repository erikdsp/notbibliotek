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

type UnsavedChangesOnVersionSwitchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscardAndSwitch: () => void;
};

export function UnsavedChangesOnVersionSwitchDialog({
  open,
  onOpenChange,
  onDiscardAndSwitch,
}: UnsavedChangesOnVersionSwitchDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent overlayClassName="bg-black/40 supports-backdrop-filter:backdrop-blur-[1px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Your unsaved changes to Score and Parts will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDiscardAndSwitch}>
            Discard & Switch
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
