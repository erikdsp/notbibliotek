import { Table, TableBody, TableHeader } from "@/components/ui/table";
import type { SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SetlistTableHeadRow } from "@/features/musician/components/SetlistTableHeadRow";
import { SetlistTableRows } from "@/features/musician/components/SetlistTableRows";
import { SongTableHeadRow } from "@/features/musician/components/SongTableHeadRow";
import { SongTableRows } from "@/features/musician/components/SongTableRows";

type SheetMusicTableProps = {
  songs: SongResponse[];
  showDetailedList: boolean;
  instrumentSelected: boolean;
  selectedSongId: string | null;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
};

export function SheetMusicTable({
  songs,
  showDetailedList,
  instrumentSelected,
  selectedSongId,
  isDownloading,
  onDownload,
}: SheetMusicTableProps) {
  const isSongMode = selectedSongId !== null;
  const selectedSong = songs.find((song) => song.id === selectedSongId);
  const currentVersion = selectedSong?.versions.find(
    (version) => version.song_version_id === selectedSong.current_version_id,
  );

  if (isSongMode && !currentVersion) {
    return null;
  }

  return (
    <Table className="w-full">
      <TableHeader className="border-b-2">
        {isSongMode ? (
          <SongTableHeadRow />
        ) : (
          <SetlistTableHeadRow showDetailedList={showDetailedList} />
        )}
      </TableHeader>

      <TableBody>
        {isSongMode ? (
          <SongTableRows
            currentVersion={currentVersion}
            isDownloading={isDownloading}
            onDownload={onDownload}
          />
        ) : (
          <SetlistTableRows
            songs={songs}
            showDetailedList={showDetailedList}
            instrumentSelected={instrumentSelected}
            isDownloading={isDownloading}
            onDownload={onDownload}
          />
        )}
      </TableBody>
    </Table>
  );
}
