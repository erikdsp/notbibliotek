import type { Version } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import {
  previewTitleFromPartNames,
  previewTitleFromScoreName,
} from "@/utils/preview-title";

type SongTableRowsProps = {
  currentVersion: Version | undefined;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata, title: string) => void;
};

export function SongTableRows({
  currentVersion,
  isDownloading,
  onDownload,
  onPreview,
}: SongTableRowsProps) {
  if (!currentVersion) {
    return null;
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Preview score`}
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
              disabled={isDownloading}
              onClick={() => onDownload(score.file)}
            >
              <Download /> Download PDF
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {currentVersion.parts.map((part) => {
        return (
          <TableRow key={part.id}>
            <TableCell className="font-medium"></TableCell>

            <TableCell>{part.name}</TableCell>

            <TableCell></TableCell>
            <TableCell className="pl-8">
              <div className="flex items-center gap-2">
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
                  disabled={isDownloading}
                  onClick={() => onDownload(part.file)}
                >
                  <Download /> Download PDF
                </Button>
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
