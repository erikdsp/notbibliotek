import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SongTitleInputProps = {
  title: string;
  onSetTitle: (value: string) => void
  hasSong: boolean;
  titleError: string | undefined;
};

export function SongTitleInput({
  title,
  onSetTitle,
  hasSong,
  titleError,
}: SongTitleInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="song-title">Song Title</Label>
      <Input
        id="song-title"
        value={title}
        onChange={(event) => onSetTitle(event.target.value)}
        placeholder="Song title"
        className={hasSong ? "w-[66%]" : "w-full"}
      />

      {titleError && (
        <p className="text-sm text-muted-foreground">(required)</p>
      )}
    </div>
  );
}
