import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import type { Instrument } from "@/core/types";
import {
  AddPartInstrumentsPopover,
  SelectedPartInstruments,
} from "@/features/admin/components/songs/editor";
import type { PartErrors } from "@/features/admin/lib";
import type { EditablePart } from "@/features/admin/types";
import { previewTitleFromPartNames } from "@/utils";
import { Eye, FileText, FileUp, X } from "lucide-react";
import { useRef } from "react";

type PartEditorProps = {
  part: EditablePart;
  instruments: Instrument[];
  partErrors: PartErrors;
  isPublished: boolean;
  isArchived: boolean;
  onUpdatePart: (localId: string, update: Partial<EditablePart>) => void;
  onRemovePart: (localId: string) => void;
  onReplaceFile: (localId: string, file: File) => void;
  onAddInstrumentConnection: (part: EditablePart, instrumentId: string) => void;
  onRemoveInstrumentConnection: (
    part: EditablePart,
    instrumentId: string,
  ) => void;
  onPreviewFile: (
    file: File | null,
    fileId: string | null,
    title: string,
  ) => void;
};

export function PartEditor({
  part,
  instruments,
  partErrors,
  isPublished,
  isArchived,
  onUpdatePart,
  onRemovePart,
  onReplaceFile,
  onAddInstrumentConnection,
  onRemoveInstrumentConnection,
  onPreviewFile,
}: PartEditorProps) {
  const readOnly = isPublished || isArchived;

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePreviewFile() {
    onPreviewFile(
      part.file,
      part.file_id,
      previewTitleFromPartNames(part.file_name, part.name),
    );
  }

  function handleReplaceFileDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const files = event.dataTransfer.files;

    if (files.length !== 1) {
      toast.add({
        type: "error",
        description: "Oops! You dropped several files. Only one PDF please.",
        priority: "high",
      });
      return;
    }

    onReplaceFile(part.local_id, files[0]);
  }

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

  function handlePartNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    onUpdatePart(part.local_id, {
      name: event.currentTarget.value,
    });
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
          onClick={handlePreviewFile}
        >
          <Eye className="size-4" />
        </Button>

        <div className="flex-1" />

        {!readOnly && (
          <>
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-1 px-10 text-center mr-6"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleReplaceFileDrop}
            >
              <div className="flex items-center justify-center gap-2">
                <FileUp className="size-4 text-muted-foreground" />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={handleReplaceFileClick}
                >
                  Replace file
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={handleReplaceFileChange}
                />
              </div>
            </div>
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
            disabled={readOnly}
            onChange={handlePartNameChange}
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
              readOnly={isArchived}
            />

            {!isArchived && (
              <AddPartInstrumentsPopover
                instrumentIds={part.instrument_ids}
                instruments={instruments}
                onAddInstrumentConnection={handleAddInstrumentConnection}
                onRemoveInstrumentConnection={handleRemoveInstrumentConnection}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
