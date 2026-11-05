import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

type EditSongFooterProps = {
  isPublished: boolean;
  isSaving: boolean;
  saveDisabled: boolean;
  publishDisabled: boolean;
  onClose: () => void;
  onSave: () => void;
  onPublish: () => void;
};

export function EditSongFooter({
  isPublished,
  isSaving,
  saveDisabled,
  publishDisabled,
  onClose,
  onSave,
  onPublish,
}: EditSongFooterProps) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>

      <Button
        variant={isPublished ? "default" : "outline"}
        disabled={saveDisabled}
        onClick={onSave}
      >
        {isSaving ? "Saving..." : isPublished ? "Save Changes" : "Save Draft"}
      </Button>

      {!isPublished && (
        <Button disabled={publishDisabled} onClick={onPublish}>
          Publish Version
        </Button>
      )}
    </DialogFooter>
  );
}
