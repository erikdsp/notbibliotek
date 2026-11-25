import type { SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { formatDateTime } from "@/utils/format-time";
import { previewTitleFromPartNames } from "@/utils/preview-title";
import { getCurrentVersion } from "@/features/musician/lib/get-current-version";

type SetlistListProps = {
  songs: SongResponse[];
  partsSelected: boolean;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata, title: string) => void;
};

export function SetlistList({
  songs,
  partsSelected,
  isDownloading,
  onDownload,
  onPreview,
}: SetlistListProps) {
  return (
    <div className="w-full divide-y border-t mt-9 md:mt-3">
      {songs.map((song) => {
        const currentVersion = getCurrentVersion(song);

        if (!currentVersion) {
          return (
            <div key={song.id} className="py-4 last:pb-0">
              <h3 className="font-medium wrap-break-words">{song.title}</h3>
              <p className="text-sm text-muted-foreground">
                No published version
              </p>
            </div>
          );
        }

        if (currentVersion.parts.length === 0 || !partsSelected) {
          return (
            <div key={song.id} className="py-4 last:pb-0">
              <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-4">
                <h3 className="min-w-0 font-medium wrap-break-words">
                  {song.title}
                </h3>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {formatDateTime(currentVersion.published_at)}
                </span>
              </div>
            </div>
          );
        }

        return (
          <div key={song.id} className="py-4 last:pb-0">
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-4">
              <h3 className="min-w-0 font-medium wrap-break-words">
                {song.title}
              </h3>
              <span className="shrink-0 text-sm text-muted-foreground">
                {formatDateTime(currentVersion.published_at)}
              </span>
            </div>

            <div className="pl-3 md:pl-6 mt-3 divide-y">
              {currentVersion.parts.map((part) => {
                return (
                  <div
                    key={part.id}
                    className="flex min-w-0 items-center justify-between gap-2 py-2"
                  >
                    <span className="min-w-0 flex-1 wrap-break-words text-sm">
                      {part.name}
                    </span>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Preview ${part.name}`}
                        onClick={() =>
                          onPreview(
                            part.file,
                            previewTitleFromPartNames(
                              part.file.name,
                              part.name,
                            ),
                          )
                        }
                      >
                        <Eye />
                      </Button>

                      <Button
                        className="md:hidden"
                        variant="secondary"
                        size="icon-sm"
                        aria-label={`Download ${part.name}`}
                        disabled={isDownloading}
                        onClick={() => onDownload(part.file)}
                      >
                        <Download />
                      </Button>
                      <Button
                        className={"hidden md:inline-flex"}
                        variant="secondary"
                        size="sm"
                        aria-label={`Download ${part.name}`}
                        disabled={isDownloading}
                        onClick={() => onDownload(part.file)}
                      >
                        <Download />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
