import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSongs } from "@/hooks/use-songs";
import { useConcerts } from "@/hooks/use-concerts";
import { useInstruments } from "@/hooks/use-instruments";

import { useState } from "react";
import { SheetMusicFilters } from "@/features/musician/components/SheetMusicFilters";
import type { SongFilters } from "@/services/songs-service";
import { createLogger } from "@/utils/logger";
import { formatDateTime } from "@/utils/format-time";
import { Download } from "lucide-react";
import {
  allItemsValue,
  oddPartsValue,
} from "@/features/musician/constants/select-options";
import { useDownloadFile } from "@/hooks/use-download-file";
import type { FileMetadata } from "@/core/types/file";

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

          <section
            className={`w-full rounded-lg border p-6 ${showDetailedList ? "max-w-4xl" : "max-w-2xl"}`}
          >
            <h2 className="text-2xl font-bold mb-4">
              {selectedConcertDetails
                ? selectedConcertDetails.name
                : "All Songs in the Library"}{" "}
            </h2>
            {selectedConcertDetails && (
              <p className="mb-2">{selectedConcertDetails.date}</p>
            )}
            <Table className="w-full">
              <TableHeader className="border-b-2">
                <TableRow className=" text-base">
                  <TableHead className="w-60 font-normal">Song</TableHead>
                  <TableHead className="font-normal">
                    {" "}
                    {showDetailedList && "Parts"}{" "}
                  </TableHead>
                  <TableHead className="w-25 font-normal">Version</TableHead>
                  {showDetailedList && (
                    <TableHead className="w-14 pl-8 font-normal"></TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song) => {
                  const currentVersion = song.versions.find(
                    (version) =>
                      version.song_version_id === song.current_version_id,
                  );

                  if (!currentVersion) {
                    return (
                      <TableRow key={song.id}>
                        <TableCell className="font-medium">
                          {song.title}
                        </TableCell>
                        <TableCell className="italic"></TableCell>
                        <TableCell className="italic">
                          No published version
                        </TableCell>
                      </TableRow>
                    );
                  }

                  if (currentVersion.parts.length === 0 || !showDetailedList) {
                    return (
                      <TableRow key={song.id}>
                        <TableCell className="font-medium">
                          {song.title}
                        </TableCell>
                        <TableCell className="italic">
                          {instrumentSelected && "Missing"}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(currentVersion.published_at)}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return currentVersion.parts.map((part, partIndex) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">
                        {partIndex === 0 ? song.title : null}
                      </TableCell>

                      <TableCell>{part.name}</TableCell>

                      <TableCell>
                        {partIndex === 0
                          ? formatDateTime(currentVersion.published_at)
                          : null}
                      </TableCell>
                      <TableCell className="pl-8">
                        <Button
                          variant="secondary"
                          disabled={downloadFile.isPending}
                          onClick={() => handleDownload(part.file)}
                        >
                          <Download /> Download PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </section>
          <div className="pt-6 flex flex-1 flex-col items-center gap-4">
            {concertSelected && (
              <Button variant="outline" disabled>
                <Download /> Download Set List
              </Button>
            )}
            {showDetailedList && (
              <Button disabled>
                <Download /> Download Sheet Music {concertSelected && "and Set List"} (.zip)
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
