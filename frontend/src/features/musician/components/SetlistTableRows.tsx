import type { SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/utils/format-time";
import { Download, Eye } from "lucide-react";

type SetlistTableRowsProps = {
  songs: SongResponse[];
  showDetailedList: boolean;
  instrumentSelected: boolean;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata) => void;
};

export function SetlistTableRows({
  songs,
  showDetailedList,
  instrumentSelected,
  isDownloading,
  onDownload,
  onPreview,
}: SetlistTableRowsProps) {
  return (
    <>
      {songs.map((song) => {
        const currentVersion = song.versions.find(
          (version) => version.song_version_id === song.current_version_id,
        );

        if (!currentVersion) {
          return (
            <TableRow key={song.id}>
              <TableCell className="font-medium">{song.title}</TableCell>
              <TableCell className="italic"></TableCell>
              <TableCell className="italic">No published version</TableCell>
            </TableRow>
          );
        }

        if (currentVersion.parts.length === 0 || !showDetailedList) {
          return (
            <TableRow key={song.id}>
              <TableCell className="font-medium">{song.title}</TableCell>
              <TableCell className="italic">
                {instrumentSelected && "Missing"}
              </TableCell>
              <TableCell>
                {formatDateTime(currentVersion.published_at)}
              </TableCell>
            </TableRow>
          );
        }

        return currentVersion.parts.map((part, partIndex) => {
          const isFirstRow = partIndex === 0;

          return (
            <TableRow key={part.id}>
              <TableCell className="font-medium">
                {isFirstRow ? song.title : null}
              </TableCell>

              <TableCell>{part.name}</TableCell>

              <TableCell>
                {isFirstRow
                  ? formatDateTime(currentVersion.published_at)
                  : null}
              </TableCell>
              <TableCell className="pl-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Preview ${part.name}`}
                    onClick={() => onPreview(part.file)}
                  >
                    <Eye />
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={isDownloading}
                    onClick={() => onDownload(part.file)}
                  >
                    <Download /> Download PDF
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        });
      })}
    </>
  );
}
