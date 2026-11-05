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
  const selectedSong = songs.find((song) => song.id === selectedSongId);
  const currentVersion = selectedSong?.versions.find(
    (version) => version.song_version_id === selectedSong.current_version_id,
  );

  if (selectedSong && !currentVersion) {
    return null;
  }

  return (
    <Table className="w-full">
      <TableHeader className="border-b-2">
        <TableRow className=" text-base">
          <TableHead className={`font-normal ${!selectedSong && "w-60"}`}>
            {" "}
            {!selectedSong && "Song"}{" "}
          </TableHead>
          <TableHead className="font-normal">
            {showDetailedList && "Parts"}
          </TableHead>
          <TableHead className={`font-normal ${!selectedSong && "w-25"}`}>
            {" "}
            {!selectedSong && "Version"}{" "}
          </TableHead>
          {showDetailedList && (
            <TableHead className="w-14 pl-8 font-normal"></TableHead>
          )}
        </TableRow>
      </TableHeader>

      <TableBody>
        {selectedSong ? (
          <SongTableRows
            song={selectedSong}
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
