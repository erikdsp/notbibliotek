import { Button } from "@/components/ui/button";
import type { Instrument } from "@/core/types";
import { PartEditor } from "@/features/admin/components/songs/editor";
import type { PartErrors } from "@/features/admin/lib";
import type { EditablePart } from "@/features/admin/types";
import { Upload } from "lucide-react";
import { useRef } from "react";

type PartsSectionProps = {
  parts: EditablePart[] | null;
  instruments: Instrument[];
  partErrors: Record<string, PartErrors>;
  isPublished: boolean;
  isArchived: boolean;
  onAddPartFiles: (files: FileList | File[]) => void;
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

export function PartsSection({
  parts,
  instruments,
  partErrors,
  isPublished,
  isArchived,
  onAddPartFiles,
  onUpdatePart,
  onRemovePart,
  onReplaceFile,
  onAddInstrumentConnection,
  onRemoveInstrumentConnection,
  onPreviewFile,
}: PartsSectionProps) {
  const filesReadOnly = isPublished || isArchived;

  const partsInputRef = useRef<HTMLInputElement>(null);

  function handleDropPartFiles(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    onAddPartFiles(event.dataTransfer.files);
  }

  function handleSelectPartFiles() {
    partsInputRef.current?.click();
  }

  function handlePartFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;

    if (input.files) {
      onAddPartFiles(input.files);
    }

    input.value = "";
  }

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">Parts</h3>

      {!filesReadOnly && (
        <div
          className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropPartFiles}
        >
          <Upload className="size-5 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">Drop Part PDFs here</p>

          <Button variant="outline" size="sm" onClick={handleSelectPartFiles}>
            Select Parts
          </Button>

          <input
            ref={partsInputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={handlePartFilesChange}
          />
        </div>
      )}

      <div className="space-y-3">
        {parts !== null &&
          parts.map((part) => {
            return (
              <PartEditor
                key={part.local_id}
                part={part}
                instruments={instruments}
                partErrors={partErrors[part.local_id]}
                isPublished={isPublished}
                isArchived={isArchived}
                onUpdatePart={onUpdatePart}
                onRemovePart={onRemovePart}
                onAddInstrumentConnection={onAddInstrumentConnection}
                onRemoveInstrumentConnection={onRemoveInstrumentConnection}
                onReplaceFile={onReplaceFile}
                onPreviewFile={onPreviewFile}
              />
            );
          })}
      </div>
    </section>
  );
}
