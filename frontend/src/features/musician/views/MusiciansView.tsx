import { Separator } from "@/components/ui/separator";
import { useSongs } from "@/hooks/use-songs";
import { useConcerts } from "@/hooks/use-concerts";
import { useInstruments } from "@/hooks/use-instruments";

import { useState } from "react";
import { SheetMusicFilters } from "@/features/musician/components/SheetMusicFilters";
import type { SongFilters } from "@/services/songs-service";
import { createLogger } from "@/utils/logger";
import {
  allItemsValue,
  oddPartsValue,
} from "@/features/musician/constants/select-options";
import { useDownloadFile } from "@/hooks/use-download-file";
import type { FileMetadata } from "@/core/types/file";
import { SheetMusicSection } from "@/features/musician/components/SheetMusicSection";
import { usePdfPreview } from "@/hooks/use-pdf-preview";
import { PdfPreviewDialog } from "@/components/pdf-preview/PdfPreviewDialog";

const log = createLogger("MusiciansView");

export function MusiciansView() {
  const [selectedConcert, setSelectedConcert] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(
    null,
  );
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [includeScore, setIncludeScore] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [preview, setPreview] = useState<{
    file: FileMetadata;
    title: string;
  } | null>(null);

  const concertSelected = selectedConcert !== null;
  const instrumentSelected =
    selectedInstrument !== null && selectedInstrument !== oddPartsValue;
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

  const {
    data: previewBlob,
    isPending: previewIsPending,
    error: previewError,
  } = usePdfPreview(preview?.file.id ?? null);

  function handlePreview(file: FileMetadata, title: string) {
    setPreview({ file, title });
  }

  function handleSelectInstrument(instrumentId: string | null) {
    setSelectedInstrument(instrumentId !== allItemsValue ? instrumentId : null);
    setSelectedSongId(null);
  }

  function handleSelectConcert(concertId: string | null) {
    setSelectedConcert(concertId !== allItemsValue ? concertId : null);
    setSelectedSongId(null);
  }

  function handleSelectSong(selectedSongId: string | null) {
    setSelectedSongId(selectedSongId !== allItemsValue ? selectedSongId : null);
    setSelectedInstrument(null);
    setSelectedConcert(null);
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
            onConcertChange={handleSelectConcert}
            selectedInstrument={selectedInstrument}
            onInstrumentChange={handleSelectInstrument}
            selectedSongId={selectedSongId}
            onSongChange={handleSelectSong}
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
            selectedSongId={selectedSongId}
            isDownloading={downloadFile.isPending}
            onDownload={handleDownload}
            onPreview={handlePreview}
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
