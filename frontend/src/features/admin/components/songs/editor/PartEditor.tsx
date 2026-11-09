import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Instrument } from "@/core/types";
import { AddPartInstrumentPopover } from "@/features/admin/components/songs/editor/AddPartInstrumentsPopover";
import { SelectedPartInstruments } from "@/features/admin/components/songs/editor/SelectedPartInstruments";
import type { PartErrors } from "@/features/admin/lib/validate-song-draft";
import type { EditablePart } from "@/features/admin/types";
import { Eye, FileText, FileUp, X } from "lucide-react";
import { useRef } from "react";

type PartEditorProps = {
  part: EditablePart;
  instruments: Instrument[];
  partErrors: PartErrors;
  isPublished: boolean;
  onUpdatePart: (localId: string, update: Partial<EditablePart>) => void;
  onRemovePart: (localId: string) => void;
  onReplaceFile: (localId: string, file: File) => void;
  onAddInstrumentConnection: (part: EditablePart, instrumentId: string) => void;
  onRemoveInstrumentConnection: (
    part: EditablePart,
    instrumentId: string,
  ) => void;
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
  onAddInstrumentConnection,
  onRemoveInstrumentConnection,
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

  const handleAddInstrumentConnection = (instrumentId: string) => {
    onAddInstrumentConnection(part, instrumentId);
  };

  const handleRemoveInstrumentConnection = (instrumentId: string) => {
    onRemoveInstrumentConnection(part, instrumentId);
  };

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <FileText className="size-4 shrink-0 text-muted-foreground" />

        <span className="min-w-0 truncate text-sm mr-1">{part.file_name}</span>

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
            <SelectedPartInstruments
              instrumentIds={part.instrument_ids}
              instruments={instruments}
              onRemoveInstrumentConnection={handleRemoveInstrumentConnection}
            />

            <AddPartInstrumentPopover
              instrumentIds={part.instrument_ids}
              instruments={instruments}
              onAddInstrumentConnection={handleAddInstrumentConnection}
              onRemoveInstrumentConnection={handleRemoveInstrumentConnection}
            />

          </div>
        </div>
      </div>
    </div>
  );
}
