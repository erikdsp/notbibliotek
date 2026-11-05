import { Button } from "@/components/ui/button";
import type { ConcertDetailedResponse, SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { SheetMusicTable } from "@/features/musician/components/SheetMusicTable";
import { Download } from "lucide-react";

type SheetMusicSectionProps = {
  songs: SongResponse[];
  selectedConcertDetails: ConcertDetailedResponse | undefined;
  showDetailedList: boolean;
  concertSelected: boolean;
  instrumentSelected: boolean;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
};

export function SheetMusicSection({
  songs,
  selectedConcertDetails,
  showDetailedList,
  concertSelected,
  instrumentSelected,
  isDownloading,
  onDownload,
}: SheetMusicSectionProps) {
  return (
    <section
      className={`flex flex-col items-center w-full ${showDetailedList ? "max-w-4xl" : "max-w-2xl"}`}
    >
      <div className={`w-full rounded-lg border p-6`}>
        <h2 className="text-2xl font-bold mb-4">
          {selectedConcertDetails
            ? selectedConcertDetails.name
            : "All Songs in the Library"}{" "}
        </h2>
        {selectedConcertDetails && (
          <p className="mb-2">{selectedConcertDetails.date}</p>
        )}

        <SheetMusicTable
          songs={songs}
          showDetailedList={showDetailedList}
          instrumentSelected={instrumentSelected}
          isDownloading={isDownloading}
          onDownload={onDownload}
        />
      </div>

      <div className="pt-6 flex flex-1 flex-col items-center gap-4">
        {concertSelected && (
          <Button variant="outline" disabled>
            <Download /> Download Set List
          </Button>
        )}
        {showDetailedList && (
          <Button disabled>
            <Download /> Download Sheet Music{" "}
            {concertSelected && "and Set List"} (.zip)
          </Button>
        )}
      </div>
    </section>
  );
}
