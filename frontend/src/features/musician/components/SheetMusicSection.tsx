import type { ConcertDetailedResponse, SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SetlistTable } from "@/features/musician/components/SetlistTable";
import { SheetMusicSectionHeader } from "@/features/musician/components/SheetMusicSectionHeader";
import { SongTable } from "@/features/musician/components/SongTable";
import {
  getSetlistHeaderData,
  getSongHeaderData,
} from "@/features/musician/lib/get-header-data";

type SheetMusicSectionProps = {
  songSelected: boolean;
  partsSelected: boolean;
  songs: SongResponse[];
  selectedConcertDetails: ConcertDetailedResponse | undefined;
  selectedSong: SongResponse | undefined;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata, title: string) => void;
  onDownloadAll: () => void;
};

export function SheetMusicSection({
  songSelected,
  partsSelected,
  songs,
  selectedConcertDetails,
  selectedSong,
  isDownloading,
  onDownload,
  onPreview,
  onDownloadAll,
}: SheetMusicSectionProps) {
  if (songSelected && selectedSong === undefined) {
    return <p role="alert">Selected song could not be found.</p>;
  }

  const headerData = selectedSong
    ? getSongHeaderData({ selectedSong })
    : getSetlistHeaderData({ partsSelected, selectedConcertDetails });

  return (
    <section
      className={`flex flex-col items-center w-full ${partsSelected ? "max-w-4xl" : "max-w-2xl"}`}
    >
      <div className={`w-full rounded-lg border p-6 `}>
        <SheetMusicSectionHeader
          headerData={headerData}
          isDownloading={isDownloading}
          onDownloadAll={onDownloadAll}
        />

        {songSelected ? (
          <SongTable
            selectedSong={selectedSong}
            isDownloading={isDownloading}
            onDownload={onDownload}
            onPreview={onPreview}
          />
        ) : (
          <SetlistTable
            songs={songs}
            partsSelected={partsSelected}
            isDownloading={isDownloading}
            onDownload={onDownload}
            onPreview={onPreview}
          />
        )}
      </div>
    </section>
  );
}
