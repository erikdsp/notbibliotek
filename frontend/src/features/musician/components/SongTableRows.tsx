import type { SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type SongTableRowsProps = {
  song: SongResponse;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
};

export function SongTableRows({
  song,
  isDownloading,
  onDownload,
}: SongTableRowsProps) {
  const currentVersion = song.versions.find(
    (version) => version.song_version_id === song.current_version_id,
  );

  if (!currentVersion) {
    return;
  }

  if (!currentVersion.score) {
    return null;
  }

  const score = currentVersion.score;

  return (
    <>
      <TableRow key={"fullscore"} className="border-b-2">
        <TableCell className="font-medium"></TableCell>

        <TableCell className="font-bold">Full Score</TableCell>

        <TableCell></TableCell>
        <TableCell className="pl-8">
          <Button
            variant="secondary"
            disabled={isDownloading}
            onClick={() => onDownload(score.file)}
          >
            <Download /> Download PDF
          </Button>
        </TableCell>
      </TableRow>
      {currentVersion.parts.map((part) => {
        return (
          <TableRow key={part.id}>
            <TableCell className="font-medium"></TableCell>

            <TableCell>{part.name}</TableCell>

            <TableCell></TableCell>
            <TableCell className="pl-8">
              <Button
                variant="secondary"
                disabled={isDownloading}
                onClick={() => onDownload(part.file)}
              >
                <Download /> Download PDF
              </Button>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
