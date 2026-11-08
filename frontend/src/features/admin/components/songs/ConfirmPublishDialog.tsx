import { AlertTriangle } from "lucide-react";
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
          {/* Score */}
          <section className="space-y-2">
            <h3 className="px-3 text-sm font-semibold">Score</h3>
            <div className="rounded-md px-3 py-2 text-sm">
              {score?.file_name ?? "No score"}
            </div>
          </section>

          {/* Parts */}
          <section className="space-y-2">
            <h3 className="px-3 text-sm font-semibold">
              Parts ({parts?.length ?? 0})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Instruments</th>
                    <th className="px-3 py-2 font-medium">File</th>
                  </tr>
                </thead>

                <tbody>
                  {parts?.map((part) => (
                    <tr
                      key={part.local_id}
                      className="border-b last:border-0"
                    >
                      <td className="px-3 py-2">{part.name}</td>
                      <td className="px-3 py-2">
                        {part.instrument_ids.length > 0 ? (
                          part.instrument_ids
                            .map(
                              (id) =>
                                instruments.find((i) => i.id === id)?.name,
                            )
                            .filter(Boolean)
                            .join(", ")
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <AlertTriangle className="size-4 text-amber-600" />
                            None
                          </span>
                        )}
                      </td>
                      <td className="max-w-48 truncate px-3 py-2">
                        {part.file_name ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
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