import { Table, TableBody, TableHeader } from "@/components/ui/table";
import type { SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SongTableHeadRow } from "@/features/musician/components/SongTableHeadRow";
import { SongTableRows } from "@/features/musician/components/SongTableRows";
import { getCurrentVersion } from "@/features/musician/lib/get-current-version";

type SongTableProps = {
  selectedSong: SongResponse | undefined;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata, title: string) => void;
};

export function SongTable({
  selectedSong,
  isDownloading,
  onDownload,
  onPreview,
}: SongTableProps) {

  const currentVersion = getCurrentVersion(selectedSong);

  return (
    <Table className="w-full mt-3">
      <TableHeader className="border-b-2">
        <SongTableHeadRow />
      </TableHeader>
      <TableBody>
        <SongTableRows
          currentVersion={currentVersion}
          isDownloading={isDownloading}
          onDownload={onDownload}
          onPreview={onPreview}
        />
      </TableBody>
    </Table>
  );
}
