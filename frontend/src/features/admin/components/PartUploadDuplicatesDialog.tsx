import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { FileConflict } from "./SongEditorForm";

type ConflictAction = "skip" | "replace";

type PartUploadDuplicatesDialogProps = {
  conflicts: FileConflict[];
  onActionChange: (index: number, action: ConflictAction) => void;
  onAllActionChange: (action: ConflictAction) => void;
};

type DuplicateRowProps = {
  conflict: FileConflict;
  index: number;
  onActionChange: (index: number, action: ConflictAction) => void;
};

function DuplicateRow({ conflict, index, onActionChange }: DuplicateRowProps) {
  function handleSkip() {
    onActionChange(index, "skip");
  }

  function handleReplace() {
    onActionChange(index, "replace");
  }

  return (
    <>
      <span className="min-w-0 wrap-anywhere text-sm">
        {conflict.file.name}
      </span>

      <span className="min-w-0 wrap-anywhere text-sm">
        {conflict.existingPartName}
      </span>

      <Button type="button" size="sm" variant="outline" onClick={handleSkip}>
        Skip
      </Button>

      <Button type="button" size="sm" variant="outline" onClick={handleReplace}>
        Replace
      </Button>
    </>
  );
}

export function PartUploadDuplicatesDialog({
  conflicts,
  onActionChange,
  onAllActionChange,
}: PartUploadDuplicatesDialogProps) {
  function handleSkipAll() {
    onAllActionChange("skip");
  }

  function handleOpenChange(open: boolean) {
    if (!open) handleSkipAll();
  }

  function handleReplaceAll() {
    onAllActionChange("replace");
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-[95vw] sm:max-w-4xl flex-col overflow-hidden"
        overlayClassName="bg-black/20 supports-backdrop-filter:backdrop-blur-[1px]"
      >
        <DialogHeader>
          <DialogTitle className="mt-2">
            You have uploaded parts with duplicate filenames
          </DialogTitle>
          <DialogDescription>
            Choose whether to skip or replace each duplicate file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-3 overflow-y-auto">
          <span className="text-sm font-medium">File</span>
          <span className="text-sm font-medium">Part</span>
          <span />
          <span />

          {conflicts.map((conflict, index) => (
            <DuplicateRow
              key={conflict.existingPartLocalId}
              conflict={conflict}
              index={index}
              onActionChange={onActionChange}
            />
          ))}

          <div className="col-span-2 mt-4" />

          <Button
          className="mt-4"
            type="button"
            size="sm"
            onClick={handleSkipAll}
          >
            Skip All
          </Button>
          <Button
          className="mt-4"
            type="button"
            size="sm"
            onClick={handleReplaceAll}
          >
            Replace All
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
