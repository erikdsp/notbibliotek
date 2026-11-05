import { Separator } from "@/components/ui/separator";
import { useSongs } from "@/hooks/use-songs";
import { useConcerts } from "@/hooks/use-concerts";
import { useInstruments } from "@/hooks/use-instruments";

import { useState } from "react";
import { SheetMusicFilters } from "../components/SheetMusicFilters";
import type { SongFilters } from "@/services/songs-service";
import { createLogger } from "@/utils/logger";
import {
  allItemsValue,
  oddPartsValue,
} from "@/features/musician/constants/select-options";
import { useDownloadFile } from "@/hooks/use-download-file";
import type { FileMetadata } from "@/core/types/file";
import { SheetMusicSection } from "@/features/musician/components/SheetMusicSection";

const log = createLogger("MusiciansView");

export function MusiciansView() {
  const [selectedConcert, setSelectedConcert] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(
    null,
  );
  const [includeScore, setIncludeScore] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);

  const concertSelected =
    selectedConcert !== null && selectedConcert !== allItemsValue;
  const instrumentSelected =
    selectedInstrument !== null &&
    selectedInstrument !== allItemsValue &&
    selectedInstrument !== oddPartsValue;
  const includeUnconnectedParts = selectedInstrument === oddPartsValue;

  const filters: SongFilters = {
    concert: concertSelected ? selectedConcert : undefined,
    instrument: instrumentSelected ? [selectedInstrument] : undefined,
    include_unconnected_parts: includeUnconnectedParts || undefined,
    include_score: includeScore || undefined,
  };

  const showDetailedList = instrumentSelected || includeUnconnectedParts;

  const {
    data: allSongs = [],
    isLoading: allSongsIsLoading,
    isError: allSongsIsError,
  } = useSongs();

  const {
    data: songs = [],
    isLoading: songsIsLoading,
    isError: songsIsError,
  } = useSongs(filters);

  log.debug("song filters: ", filters, "songs: ", songs);

  const {
    data: concerts = [],
    isLoading: concertsIsLoading,
    isError: concertsIsError,
  } = useConcerts();

  const {
    data: instruments = [],
    isLoading: instrumentsIsLoading,
    isError: instrumentsIsError,
  } = useInstruments();

  function handleSelectInstrument(instrumentId: string | null) {
    setSelectedInstrument(instrumentId);
  }

  const downloadFile = useDownloadFile();

  function handleDownload(file: FileMetadata) {
    downloadFile.mutate({
      fileId: file.id,
      fileName: file.name,
    });
  }

  if (
    songsIsLoading ||
    allSongsIsLoading ||
    concertsIsLoading ||
    instrumentsIsLoading
  ) {
    return <div>Loading...</div>;
  }

  if (songsIsError || allSongsIsError) {
    return <div>Failed to load songs.</div>;
  }

  if (concertsIsError) {
    return <div>Failed to load concerts.</div>;
  }

  if (instrumentsIsError) {
    return <div>Failed to load instruments.</div>;
  }

  const selectedConcertDetails = concerts.find((c) => c.key == selectedConcert);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-6 pb-16">
        <section className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-6 lg:gap-6 lg:p-0">
          <div>
            <h1 className="font-josefin text-5xl font-bold mt-6 mb-4">
              Orchestra Sheet Music Library
            </h1>
          </div>
          <Separator />

          <SheetMusicFilters
            concerts={concerts}
            instruments={instruments}
            songs={allSongs}
            selectedConcert={selectedConcert}
            onConcertChange={setSelectedConcert}
            selectedInstrument={selectedInstrument}
            onInstrumentChange={handleSelectInstrument}
            includeScore={includeScore}
            onIncludeScoreChange={setIncludeScore}
            moreOptionsOpen={moreOptionsOpen}
            onMoreOptionsOpenChange={setMoreOptionsOpen}
          />

          <Separator />

          <SheetMusicSection
            songs={songs}
            selectedConcertDetails={selectedConcertDetails}
            showDetailedList={showDetailedList}
            concertSelected={concertSelected}
            instrumentSelected={instrumentSelected}
            isDownloading={downloadFile.isPending}
            onDownload={handleDownload}
          />

        </section>
      </main>
    </div>
  );
}
