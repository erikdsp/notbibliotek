import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Instrument } from "@/core/types";
import type { PartErrors } from "@/features/admin/lib/validate-song-draft";
import type { EditablePart } from "@/features/admin/types";
import { Eye, FileText, FileUp, Plus, X } from "lucide-react";
import { useRef } from "react";

type PartEditorProps = {
  part: EditablePart;
  instruments: Instrument[];
  partErrors: PartErrors;
  isPublished: boolean;
  onUpdatePart: (localId: string, update: Partial<EditablePart>) => void;
  onRemovePart: (localId: string) => void;
  onReplaceFile: (localId: string, file: File) => void;
  onToggleInstrument: (part: EditablePart, instrumentId: string) => void;
  onPreviewFile: (file: File | null) => void;
};

export function PartEditor({
  part,
  instruments,
  partErrors,
  isPublished,
  onUpdatePart,
  onRemovePart,
  onReplaceFile,
  onToggleInstrument,
  onPreviewFile,
}: PartEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleReplaceFileClick() {
    fileInputRef.current?.click();
  }

  function handleReplaceFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (file) {
      onReplaceFile(part.local_id, file);
    }

    input.value = "";
  }

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <FileText className="size-4 shrink-0 text-muted-foreground" />

        <span className="min-w-0 truncate text-sm mr-1">
          {part.file_name}
        </span>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Preview ${part.name}`}
          disabled={!part.file}
          onClick={() => onPreviewFile(part.file)}
        >
          <Eye className="size-4" />
        </Button>

        <div className="flex-1" />

        {!isPublished && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 mr-4"
              onClick={handleReplaceFileClick}
            >
              <FileUp /> Replace file
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleReplaceFileChange}
            />

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${part.name}`}
              onClick={() => onRemovePart(part.local_id)}
            >
              <X className="size-4" />
            </Button>
          </>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Part Name</Label>
          <Input
            value={part.name}
            disabled={isPublished}
            onChange={(event) =>
              onUpdatePart(part.local_id, {
                name: event.target.value,
              })
            }
            aria-invalid={!!partErrors?.name}
          />
          {partErrors?.name && (
            <p className="text-sm text-destructive">{partErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Instruments</Label>

          <div className="flex min-h-9 flex-wrap items-center gap-1 rounded-md border px-2 py-1">
            {part.instrument_ids.map((id) => {
              const instrument = instruments.find(
                (instrument) => instrument.id === id,
              );

              if (!instrument) return null;

              return (
                <Badge key={id} variant="secondary" className="gap-1">
                  {instrument.name}

                  <button
                    type="button"
                    aria-label={`Remove ${instrument.name}`}
                    onClick={() => onToggleInstrument(part, id)}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              );
            })}

            <Popover>
              <PopoverTrigger
                render={<Button variant="ghost" size="sm" className="h-7" />}
              >
                <Plus className="size-3" />
                Add instrument
              </PopoverTrigger>

              <PopoverContent align="start" className="w-56 space-y-2">
                {instruments.map((instrument) => (
                  <label
                    key={instrument.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={part.instrument_ids.includes(instrument.id)}
                      onCheckedChange={() =>
                        onToggleInstrument(part, instrument.id)
                      }
                    />

                    {instrument.name}
                  </label>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
