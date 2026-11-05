import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

type AddSongFooterProps = {
  disabled: boolean;
  onCancel: () => void;
  onCreateSong: () => void;
};

export function AddSongFooter({
  disabled,
  onCancel,
  onCreateSong,
}: AddSongFooterProps) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>

      <Button disabled={disabled} onClick={onCreateSong}>
        Create & Continue
      </Button>
    </DialogFooter>
  );
}
