import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Instrument } from "@/core/types";
import type { EditablePart, EditableScore } from "@/features/admin/types";
import { PublishScoreSummary } from "@/features/admin/components/songs/editor/dialogs/PublishScoreSummary";
import { PublishPartsSummary } from "@/features/admin/components/songs/editor/dialogs/PublishPartsSummary";

type ConfirmPublishDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: () => void;
  score: EditableScore | null;
  parts: EditablePart[] | null;
  instruments: Instrument[];
  isSaving: boolean;
  isPublishing: boolean;
  publishError: boolean;
};

export function ConfirmPublishDialog({
  open,
  onOpenChange,
  onPublish,
  score,
  parts,
  instruments,
  isSaving,
  isPublishing,
  publishError,
}: ConfirmPublishDialogProps) {


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-[95vw] sm:max-w-5xl flex-col overflow-hidden"
        overlayClassName="bg-black/20 supports-backdrop-filter:backdrop-blur-[0px]"
      >
        <DialogHeader>
          <DialogTitle>Publish Version?</DialogTitle>
          <DialogDescription>
            Review the score and parts before publishing this version.
          </DialogDescription>
          {publishError && (
            <p role="alert" className="text-sm text-destructive">
              Failed to publish version. Please try again.
            </p>
          )}
        </DialogHeader>

        <div className="-mr-5 min-h-0 flex-1 space-y-5 overflow-y-auto py-2 pr-4">
          <PublishScoreSummary score={score} />
          <PublishPartsSummary parts={parts} instruments={instruments} />
        </div>

        <DialogFooter className="shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Keep Editing
          </Button>
          <Button
            disabled={isSaving || isPublishing}
            onClick={onPublish}
          >
            {isSaving
              ? "Saving..."
              : isPublishing
                ? "Publishing..."
                : "Publish Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}