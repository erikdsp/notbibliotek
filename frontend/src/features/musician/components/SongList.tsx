import type { SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import {
  previewTitleFromPartNames,
  previewTitleFromScoreName,
} from "@/utils/preview-title";
import { getCurrentVersion } from "@/features/musician/lib/get-current-version";

type SongListProps = {
  selectedSong: SongResponse | undefined;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata, title: string) => void;
};

export function SongList({
  selectedSong,
  isDownloading,
  onDownload,
  onPreview,
}: SongListProps) {
  const currentVersion = getCurrentVersion(selectedSong);

  if (!currentVersion) {
    return null;
  }

  const score = currentVersion.score;

  return (
    <div className="w-full mt-9 md:mt-3 divide-y border-t text-sm">
      {score && (
        <div className="flex items-center justify-between gap-3 py-3 md:px-3 border-b">
          <span className="min-w-0 flex-1 font-bold wrap-break-words">
            Full Score
          </span>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Preview score"
              onClick={() =>
                onPreview(
                  score.file,
                  previewTitleFromScoreName(score.file.name),
                )
              }
            >
              <Eye />
            </Button>

            <Button
              variant="secondary"
              size="icon-sm"
              className="md:hidden"
              aria-label="Download score"
              disabled={isDownloading}
              onClick={() => onDownload(score.file)}
            >
              <Download />
            </Button>

            <Button
              variant="secondary"
              className="hidden md:inline-flex"
              disabled={isDownloading}
              onClick={() => onDownload(score.file)}
            >
              <Download /> Download PDF
            </Button>
          </div>
        </div>
      )}

      {currentVersion.parts.map((part) => {
        return (
          <div
            key={part.id}
            className="flex items-center justify-between gap-3 py-3 md:px-3"
          >
            <span className="min-w-0 flex-1 wrap-break-words">
              {part.name}
            </span>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Preview ${part.name}`}
                onClick={() =>
                  onPreview(
                    part.file,
                    previewTitleFromPartNames(part.file.name, part.name),
                  )
                }
              >
                <Eye />
              </Button>

              <Button
                variant="secondary"
                size="icon-sm"
                className="md:hidden"
                aria-label={`Download ${part.name}`}
                disabled={isDownloading}
                onClick={() => onDownload(part.file)}
              >
                <Download />
              </Button>

              <Button
                variant="secondary"
                className="hidden md:inline-flex"
                disabled={isDownloading}
                onClick={() => onDownload(part.file)}
              >
                <Download /> Download PDF
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}