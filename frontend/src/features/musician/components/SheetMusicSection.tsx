import { Button } from "@/components/ui/button";
import type { ConcertDetailedResponse, SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SheetMusicTable } from "@/features/musician/components/SheetMusicTable";
import { formatDateTime } from "@/utils/format-time";
import { Download } from "lucide-react";

type SheetMusicSectionProps = {
  songs: SongResponse[];
  selectedConcertDetails: ConcertDetailedResponse | undefined;
  showDetailedList: boolean;
  concertSelected: boolean;
  instrumentSelected: boolean;
  selectedSongId: string | null;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata) => void;
};

export function SheetMusicSection({
  songs,
  selectedConcertDetails,
  showDetailedList,
  concertSelected,
  instrumentSelected,
  selectedSongId,
  isDownloading,
  onDownload,
  onPreview,
}: SheetMusicSectionProps) {
const selectedSong = songs.find((song) => song.id === selectedSongId);
const currentVersion = selectedSong?.versions.find(version => version.song_version_id === selectedSong.current_version_id)

  return (
    <section
      className={`flex flex-col items-center w-full ${showDetailedList ? "max-w-4xl" : "max-w-2xl"}`}
    >
      <div className={`w-full rounded-lg border p-6`}>
        <h2 className="text-2xl font-bold mb-4">
          {selectedSong ? `${selectedSong.title}`:  
          selectedConcertDetails
            ? selectedConcertDetails.name
            : "All Songs in the Library"}
        </h2>
        {selectedConcertDetails && (
          <p className="mb-2">{selectedConcertDetails.date}</p>
        )}
        {selectedSong && (
          <p className="mb-2 italic">{currentVersion ? `Current version: ${formatDateTime(currentVersion.published_at)}` : "No published version"}</p>
        )}

        <SheetMusicTable
          songs={songs}
          showDetailedList={showDetailedList}
          instrumentSelected={instrumentSelected}
          selectedSongId={selectedSongId}
          isDownloading={isDownloading}
          onDownload={onDownload}
          onPreview={onPreview}
        />
      </div>

      <div className="pt-6 flex flex-1 flex-col items-center gap-4">
        {concertSelected && (
          <Button variant="outline" disabled>
            <Download /> Download Set List
          </Button>
        )}
        {(showDetailedList || currentVersion) && (
          <Button>
            <Download /> Download Sheet Music{" "}
            {concertSelected && "and Set List"} (.zip)
          </Button>
        )}
      </div>
    </section>
  );
}
