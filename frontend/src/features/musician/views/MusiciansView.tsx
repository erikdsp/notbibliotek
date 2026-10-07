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
import { SheetMusicFilters } from "../components/SheetMusicFilters";
import type { SongFilters } from "@/services/songs-service";
import { createLogger } from "@/utils/logger";
import { formatDateTime } from "@/utils/format-time";

const log = createLogger("MusiciansView");

export function MusiciansView() {
  const [selectedConcert, setSelectedConcert] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(
    null,
  );
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [includeScore, setIncludeScore] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);

  const filters: SongFilters = {
    concert:
      selectedConcert && selectedConcert !== "all"
        ? selectedConcert
        : undefined,
    instrument:
      selectedInstrument && selectedInstrument !== "all"
        ? [selectedInstrument]
        : undefined,
    part: selectedPart && selectedPart !== "all" ? [selectedPart] : undefined,
    include_score: includeScore || undefined,
  };

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
      <main className="container mx-auto px-6 py-6">
        <section className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-6 lg:gap-6 lg:p-0">
          <div>
            <h1 className="text-3xl font-bold mt-6 mb-4">
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
            onInstrumentChange={setSelectedInstrument}
            selectedPart={selectedPart}
            onPartChange={setSelectedPart}
            includeScore={includeScore}
            onIncludeScoreChange={setIncludeScore}
            moreOptionsOpen={moreOptionsOpen}
            onMoreOptionsOpenChange={setMoreOptionsOpen}
          />

          <Separator />

          <section className="max-w-lg rounded-lg border p-6">
            <h2 className="text-2xl font-bold mb-4">Concert Name</h2>
            <p className="mb-2">Date</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-25">Song</TableHead>
                  <TableHead>Parts</TableHead>
                  <TableHead>Version</TableHead>
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
                        <TableCell className="italic">Missing</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    );
                  }

                  if (currentVersion.parts.length === 0) {
                    return (
                      <TableRow key={song.id}>
                        <TableCell className="font-medium">
                          {song.title}
                        </TableCell>
                        <TableCell className="italic">Missing</TableCell>
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
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </section>
          <Button>Download Set List</Button>
          <Button>Download Sheet Music</Button>
        </section>
      </main>
    </div>
  );
}
