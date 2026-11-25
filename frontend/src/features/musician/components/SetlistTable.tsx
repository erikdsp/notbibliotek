import { Table, TableBody, TableHeader } from "@/components/ui/table";
import type { SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SetlistTableHeadRow } from "@/features/musician/components/SetlistTableHeadRow";
import { SetlistTableRows } from "@/features/musician/components/SetlistTableRows";

type SetlistTableProps = {
  songs: SongResponse[];
  partsSelected: boolean;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata, title: string) => void;
};

export function SetlistTable({
  songs,
  partsSelected,
  isDownloading,
  onDownload,
  onPreview,
}: SetlistTableProps) {
  return (
    <Table className="w-full">
      <TableHeader className="border-b-2">
        <SetlistTableHeadRow showDetailedList={partsSelected} />
      </TableHeader>
      <TableBody>
        <SetlistTableRows
          songs={songs}
          partsSelected={partsSelected}
          isDownloading={isDownloading}
          onDownload={onDownload}
          onPreview={onPreview}
        />
      </TableBody>
    </Table>
  );
}
