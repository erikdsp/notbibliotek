import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

type EditSongFooterProps = {
  isPublished: boolean;
  isArchived: boolean;
  publishDisabled: boolean;
  archiveDisabled: boolean;
  saveDisabled: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onPublish: () => void;
  onOpenArchiveDialog: () => void;
};

export function EditSongFooter({
  isPublished,
  isArchived,
  publishDisabled,
  archiveDisabled,
  saveDisabled,
  isSaving,
  onClose,
  onSave,
  onPublish,
  onOpenArchiveDialog,
}: EditSongFooterProps) {
  const archiveButtonLabel = isArchived ? "Unarchive song" : "Archive Song";

  const saveLabel = isSaving
    ? "Saving..."
    : isPublished
      ? "Save Changes"
      : "Save Draft";

  return (
    <DialogFooter>
      <Button
        variant={isArchived ? "default" : "destructive"}
        className="sm:mr-auto"
        disabled={archiveDisabled}
        onClick={onOpenArchiveDialog}
      >
        {!isArchived && <Archive />}
        {archiveButtonLabel}
      </Button>

      <Button variant="outline" onClick={onClose}>
        Close
      </Button>

      {!isArchived && (
        <>
          <Button
            variant={isPublished ? "default" : "outline"}
            disabled={saveDisabled}
            onClick={onSave}
          >
            {saveLabel}
          </Button>

          {!isPublished && (
            <Button disabled={publishDisabled} onClick={onPublish}>
              Publish Version
            </Button>
          )}
        </>
      )}
    </DialogFooter>
  );
}
