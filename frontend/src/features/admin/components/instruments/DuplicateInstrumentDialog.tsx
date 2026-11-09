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

type DuplicateInstrumentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicateInstrumentName: string | undefined;
  isSaving: boolean;
  onSaveAnyway: () => void;
};

export function DuplicateInstrumentDialog({
  open,
  onOpenChange,
  duplicateInstrumentName,
  isSaving,
  onSaveAnyway,
}: DuplicateInstrumentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent overlayClassName="bg-black/20 supports-backdrop-filter:backdrop-blur-[0.5px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate Instrument Name</AlertDialogTitle>
          <AlertDialogDescription>
            An instrument named "{duplicateInstrumentName}" already exists
            in the library. Do you want to continue anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSaveAnyway} disabled={isSaving}>
            Save Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}