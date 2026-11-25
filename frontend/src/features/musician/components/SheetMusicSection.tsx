import type { ConcertDetailedResponse, SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SheetMusicSectionHeader } from "@/features/musician/components/SheetMusicSectionHeader";
import { SheetMusicTable } from "@/features/musician/components/SheetMusicTable";
import { getSheetMusicSectionHeaderData } from "@/features/musician/lib/get-sheet-music-section-header-data";

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

  const headerData = getSheetMusicSectionHeaderData({
    songSelected,
    partsSelected,
    selectedSong,
    selectedConcertDetails,
  });

  if (headerData === null) {
    return <p role="alert">Selected song could not be found.</p>;
  }

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

        <SheetMusicTable
          songs={songs}
          partsSelected={partsSelected}
          selectedSong={selectedSong}
          isDownloading={isDownloading}
          onDownload={onDownload}
          onPreview={onPreview}
        />
      </div>
    </section>
  );
}
