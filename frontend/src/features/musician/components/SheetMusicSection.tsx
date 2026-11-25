import { Button } from "@/components/ui/button";
import type { ConcertDetailedResponse, SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SheetMusicTable } from "@/features/musician/components/SheetMusicTable";
import { getCurrentVersion } from "@/features/musician/lib/get-current-version";
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
  onPreview: (file: FileMetadata, title: string) => void;
  onDownloadAll: () => void;
};

export function SheetMusicSection({
  songs,
  selectedConcertDetails,
  showDetailedList,
  instrumentSelected,
  selectedSongId,
  isDownloading,
  onDownload,
  onPreview,
  onDownloadAll,
}: SheetMusicSectionProps) {
  const selectedSong = songs.find((song) => song.id === selectedSongId);
  const currentVersion = getCurrentVersion(selectedSong);
  const showSetlistButtons = false;
  const showDownloadZipButton = showDetailedList || currentVersion;

  return (
    <section
      className={`flex flex-col items-center w-full ${showDetailedList ? "max-w-4xl" : "max-w-2xl"}`}
    >
      <div className={`w-full rounded-lg border p-6 `}>
        <div
          className={`flex flex-col py-2 md:py-0 my-0 md:my-3 md:flex-row w-full items-start justify-between`}
        >
          <div className={`flex w-fit`}>
            <div>
              <h2 className={`text-2xl font-bold`}>
                {selectedSong
                  ? `${selectedSong.title}`
                  : selectedConcertDetails
                    ? selectedConcertDetails.name
                    : "All Songs in the Library"}
              </h2>
              {selectedConcertDetails && (
                <p className={`my-2`}>{selectedConcertDetails.date}</p>
              )}
              {selectedSong && (
                <p className={`my-2 italic`}>
                  {currentVersion
                    ? `Current version: ${formatDateTime(currentVersion.published_at)}`
                    : "No published version"}
                </p>
              )}
            </div>
          </div>
          <div
            className={`py-6 md:py-0 empty:py-0 flex flex-col w-fit self-center md:self-auto items-center gap-4`}
          >
            {showSetlistButtons && (
              <Button variant="outline" disabled>
                <Download /> Download Set List
              </Button>
            )}
            {showDownloadZipButton && (
              <Button onClick={onDownloadAll} disabled={isDownloading}>
                <Download /> Download Sheet Music{" "}
                {showSetlistButtons && "and Set List"} (.zip)
              </Button>
            )}
          </div>
        </div>

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
    </section>
  );
}
