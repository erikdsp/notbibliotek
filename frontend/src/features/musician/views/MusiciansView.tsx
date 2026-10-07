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

export function MusiciansView() {
  const [selectedConcert, setSelectedConcert] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(
    null,
  );
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [includeScore, setIncludeScore] = useState(false);

  const {
    data: songs = [],
    isLoading: songsIsLoading,
    isError: songsIsError,
  } = useSongs();

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

  if (songsIsLoading || concertsIsLoading || instrumentsIsLoading) {
    return <div>Loading...</div>;
  }

  if (songsIsError) {
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
            songs={songs}
            selectedConcert={selectedConcert}
            onConcertChange={setSelectedConcert}
            selectedInstrument={selectedInstrument}
            onInstrumentChange={setSelectedInstrument}
            selectedPart={selectedPart}
            onPartChange={setSelectedPart}
            includeScore={includeScore}
            onIncludeScoreChange={setIncludeScore}
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
                <TableRow>
                  <TableCell className="font-medium">Song 1</TableCell>
                  <TableCell>Oud</TableCell>
                  <TableCell>Date/Time</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Song 2</TableCell>
                  <TableCell>Oud</TableCell>
                  <TableCell>Date/Time</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Song 3</TableCell>
                  <TableCell className="italic">missing</TableCell>
                </TableRow>
                {songs?.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">{song.title}</TableCell>
                  </TableRow>
                ))}
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
