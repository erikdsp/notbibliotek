import { Table, TableBody, TableHeader } from "@/components/ui/table";
import type { SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SetlistTableHeadRow } from "@/features/musician/components/SetlistTableHeadRow";
import { SetlistTableRows } from "@/features/musician/components/SetlistTableRows";
import { SongTableHeadRow } from "@/features/musician/components/SongTableHeadRow";
import { SongTableRows } from "@/features/musician/components/SongTableRows";
import { getCurrentVersion } from "@/features/musician/lib/get-current-version";

type SheetMusicTableProps = {
  songs: SongResponse[];
  partsSelected: boolean;
  selectedSong: SongResponse | undefined;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata, title: string) => void;
};

export function SheetMusicTable({
  songs,
  partsSelected,
  selectedSong,
  isDownloading,
  onDownload,
  onPreview,
}: SheetMusicTableProps) {
  const isSongMode = selectedSong !== undefined;
  const currentVersion = getCurrentVersion(selectedSong);

  if (isSongMode && !currentVersion) {
    return null;
  }

  return (
    <Table className="w-full">
      <TableHeader className="border-b-2">
        {isSongMode ? (
          <SongTableHeadRow />
        ) : (
          <SetlistTableHeadRow
            showDetailedList={partsSelected}
          />
        )}
      </TableHeader>

      <TableBody>
        {isSongMode ? (
          <SongTableRows
            currentVersion={currentVersion}
            isDownloading={isDownloading}
            onDownload={onDownload}
            onPreview={onPreview}
          />
        ) : (
          <SetlistTableRows
            songs={songs}
            partsSelected={partsSelected}
            isDownloading={isDownloading}
            onDownload={onDownload}
            onPreview={onPreview}
          />
        )}
      </TableBody>
    </Table>
  );
}
