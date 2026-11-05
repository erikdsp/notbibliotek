import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SetlistTableRows } from "@/features/musician/components/SetlistTableRows";

type SheetMusicTableProps = {
  songs: SongResponse[];
  showDetailedList: boolean;
  instrumentSelected: boolean;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
};

export function SheetMusicTable({
  songs,
  showDetailedList,
  instrumentSelected,
  isDownloading,
  onDownload,
}: SheetMusicTableProps) {
  return (
    <Table className="w-full">
      <TableHeader className="border-b-2">
        <TableRow className=" text-base">
          <TableHead className="w-60 font-normal">Song</TableHead>
          <TableHead className="font-normal">
            {showDetailedList && "Parts"}
          </TableHead>
          <TableHead className="w-25 font-normal">Version</TableHead>
          {showDetailedList && (
            <TableHead className="w-14 pl-8 font-normal"></TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        <SetlistTableRows
          songs={songs}
          showDetailedList={showDetailedList}
          instrumentSelected={instrumentSelected}
          isDownloading={isDownloading}
          onDownload={onDownload}
        />
      </TableBody>
    </Table>
  );
}
