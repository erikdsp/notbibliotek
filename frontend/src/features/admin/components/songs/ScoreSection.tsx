import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { EditableScore } from "@/features/admin/types";
import { Eye, FileText, Upload, X } from "lucide-react";
import { useRef } from "react";

type ScoreSectionProps = {
  score: EditableScore | null;
  isPublished: boolean;
  onAddScoreFile: (file: File) => void;
  onRemoveScore: () => void;
  onPreviewFile: (file: File | null) => void;
};

export function ScoreSection({
  score,
  isPublished,
  onAddScoreFile,
  onRemoveScore,
  onPreviewFile,
}: ScoreSectionProps) {
  const scoreInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">Score</h3>

      {score && (
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <FileText className="size-4 shrink-0 text-muted-foreground" />

          <span className="min-w-0 truncate text-sm">{score.file_name}</span>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Preview score"
            disabled={!score.file}
            onClick={() => onPreviewFile(score.file)}
          >
            <Eye className="size-4" />
          </Button>

          <div className="flex-1" />

          {!isPublished && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Remove score"
              onClick={onRemoveScore}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      )}

      {!isPublished && (
        <div
          className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const files = event.dataTransfer.files;

            if (files.length !== 1) {
              toast.add({
                type: "error",
                description:
                  "Oops! You dropped several files. Only one score PDF please.",
                priority: "high",
              });
              return;
            }

            onAddScoreFile(files[0]);
          }}
        >
          <Upload className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drop a Score PDF here</p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => scoreInputRef.current?.click()}
          >
            Select Score
          </Button>

          <input
            ref={scoreInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onAddScoreFile(file);
              event.target.value = "";
            }}
          />
        </div>
      )}
    </section>
  );
}
