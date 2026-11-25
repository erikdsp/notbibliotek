import { useState } from "react";

import { useSongs } from "@/hooks/use-songs";
import { useConcerts } from "@/hooks/use-concerts";
import { useInstruments } from "@/hooks/use-instruments";
import { useDownloadFile } from "@/hooks/use-download-file";
import { usePdfPreview } from "@/hooks/use-pdf-preview";
import { useDownloadConcert } from "@/hooks/use-download-concert";
import { useDownloadSong } from "@/hooks/use-download-song";
import { useDownloadAllSongs } from "@/hooks/use-download-all-songs";

import type { SongFilters } from "@/services/songs-service";
import type { FileMetadata } from "@/core/types/file";
import { resetValue } from "@/types";
import { oddPartsValue } from "@/features/musician/constants/select-options";

import { Separator } from "@/components/ui/separator";
import { SheetMusicFilters } from "@/features/musician/components/SheetMusicFilters";
import { SheetMusicSection } from "@/features/musician/components/SheetMusicSection";
import { PdfPreviewDialog } from "@/components/pdf-preview/PdfPreviewDialog";

import { createLogger } from "@/utils/logger";
import { getDownloadConcertRequest } from "@/features/musician/mappers/get-download-concert-request";
import { getDownloadAllSongsRequest } from "@/features/musician/mappers/get-download-all-songs-request";
import { filterConcertsByTimespan } from "@/features/musician/lib/filter-concerts-by-timespan";

const log = createLogger("MusiciansView");

export function MusiciansView() {
  const [selectedConcertKey, setSelectedConcertKey] = useState<string | null>(
    null,
  );
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(
    null,
  );
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedTimespan, setSelectedTimespan] = useState<string | null>("1");
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [preview, setPreview] = useState<{
    file: FileMetadata;
    title: string;
  } | null>(null);

  const concertSelected = selectedConcertKey !== null;
  const instrumentSelected =
    selectedInstrument !== null && selectedInstrument !== oddPartsValue;
  const includeUnconnectedParts = selectedInstrument === oddPartsValue;

  const songSelected = selectedSongId !== null;
  const partsSelected = instrumentSelected || includeUnconnectedParts;

  const filters: SongFilters = {
    concert: concertSelected ? selectedConcertKey : undefined,
    instrument: instrumentSelected ? [selectedInstrument] : undefined,
    include_unconnected_parts: includeUnconnectedParts || undefined,
    include_score: true,
  };

  const {
    data: allSongs = [],
    isLoading: allSongsIsLoading,
    isError: allSongsIsError,
  } = useSongs();

  const {
    data: filteredSongs = [],
    isLoading: songsIsLoading,
    isError: songsIsError,
  } = useSongs(filters);

  log.debug("song filters: ", filters, "filteredSongs: ", filteredSongs);

  const {
    data: concerts = [],
    isLoading: concertsIsLoading,
    isError: concertsIsError,
  } = useConcerts();

  const filteredConcerts = filterConcertsByTimespan({
    concerts,
    timespanMonths: selectedTimespan,
    selectedConcertKey,
  });

  const {
    data: instruments = [],
    isLoading: instrumentsIsLoading,
    isError: instrumentsIsError,
  } = useInstruments();

  const {
    data: previewBlob,
    isPending: previewIsPending,
    error: previewError,
  } = usePdfPreview(preview?.file.id ?? null);

  const selectedConcertDetails = concerts.find(
    (c) => c.key == selectedConcertKey,
  );
  const selectedSong = allSongs.find((song) => song.id === selectedSongId);

  function handlePreview(file: FileMetadata, title: string) {
    setPreview({ file, title });
  }

  function handleSelectInstrument(instrumentValue: string | null) {
    setSelectedInstrument(
      instrumentValue !== resetValue ? instrumentValue : null,
    );
    setSelectedSongId(null);
  }

  function handleSelectConcert(concertValue: string | null) {
    setSelectedConcertKey(concertValue !== resetValue ? concertValue : null);
    setSelectedSongId(null);
  }

  function handleSelectSong(selectedSongValue: string | null) {
    setSelectedSongId(
      selectedSongValue !== resetValue ? selectedSongValue : null,
    );
    setSelectedInstrument(null);
    setSelectedConcertKey(null);
  }

  const downloadFile = useDownloadFile();
  const downloadAllSongs = useDownloadAllSongs();
  const downloadConcert = useDownloadConcert();
  const downloadSong = useDownloadSong();

  const isDownloading =
    downloadFile.isPending ||
    downloadAllSongs.isPending ||
    downloadConcert.isPending ||
    downloadSong.isPending;

  function handleDownloadFile(file: FileMetadata) {
    downloadFile.mutate({
      fileId: file.id,
      fileName: file.name,
    });
  }

  function handleDownloadAll() {
    if (selectedSongId !== null) {
      downloadSong.mutate(selectedSongId);
    } else if (selectedConcertDetails !== undefined) {
      const request = getDownloadConcertRequest(
        selectedConcertDetails,
        filters.instrument,
        includeUnconnectedParts,
      );
      downloadConcert.mutate({ request });
    } else {
      const request = getDownloadAllSongsRequest(
        filters.instrument,
        includeUnconnectedParts,
      );
      downloadAllSongs.mutate({ request });
    }
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-3 lg:px-6 py-6 pb-16">
        <section className="flex flex-1 flex-col items-center justify-center gap-4 px-0 md:px-3 py-6 lg:gap-6 lg:p-0">
          <div>
            <h1 className="font-josefin text-5xl font-bold mt-6 mb-4 text-center">
              Orchestra Sheet Music Library
            </h1>
          </div>
          <Separator />

          <SheetMusicFilters
            concerts={filteredConcerts}
            instruments={instruments}
            songs={allSongs}
            selectedConcertKey={selectedConcertKey}
            onConcertChange={handleSelectConcert}
            selectedInstrument={selectedInstrument}
            onInstrumentChange={handleSelectInstrument}
            selectedSongId={selectedSongId}
            onSongChange={handleSelectSong}
            selectedTimespan={selectedTimespan}
            onTimespanChange={setSelectedTimespan}
            moreOptionsOpen={moreOptionsOpen}
            onMoreOptionsOpenChange={setMoreOptionsOpen}
          />

          <Separator />

          <SheetMusicSection
            songSelected={songSelected}
            partsSelected={partsSelected}
            songs={filteredSongs}
            selectedConcertDetails={selectedConcertDetails}
            selectedSong={selectedSong}
            isDownloading={isDownloading}
            onDownload={handleDownloadFile}
            onPreview={handlePreview}
            onDownloadAll={handleDownloadAll}
          />

          <PdfPreviewDialog
            open={preview !== null}
            onOpenChange={(open) => {
              if (!open) setPreview(null);
            }}
            file={previewBlob ?? null}
            title={preview?.title}
            isLoading={previewIsPending}
            error={previewError}
          />
        </section>
      </main>
    </div>
  );
}
