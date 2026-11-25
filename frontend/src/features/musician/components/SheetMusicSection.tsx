import type { ConcertDetailedResponse, SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SetlistList } from "@/features/musician/components/SetlistList";
import { SetlistTable } from "@/features/musician/components/SetlistTable";
import { SheetMusicSectionHeader } from "@/features/musician/components/SheetMusicSectionHeader";
import { SongList } from "@/features/musician/components/SongList";
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
          <SongList
            selectedSong={selectedSong}
            isDownloading={isDownloading}
            onDownload={onDownload}
            onPreview={onPreview}
          />
        ) : (
          <>
            <div className="lg:hidden">
              <SetlistList
                songs={songs}
                partsSelected={partsSelected}
                isDownloading={isDownloading}
                onDownload={onDownload}
                onPreview={onPreview}
              />
            </div>

            <div className="hidden lg:block">
              <SetlistTable
                songs={songs}
                partsSelected={partsSelected}
                isDownloading={isDownloading}
                onDownload={onDownload}
                onPreview={onPreview}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
