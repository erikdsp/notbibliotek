import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSongs } from "@/hooks/use-songs";
import { useConcerts } from "@/hooks/use-concerts";
import { useInstruments } from "@/hooks/use-instruments";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

export function MusiciansView() {
  const [selectedConcert, setSelectedConcert] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(
    null,
  );
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [includeScore, setIncludeScore] = useState(false);

  const {
    data: songs,
    isLoading: songsIsLoading,
    isError: songsIsError,
  } = useSongs();

  const {
    data: concerts,
    isLoading: concertsIsLoading,
    isError: concertsIsError,
  } = useConcerts();

  const {
    data: instruments,
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

  const concertItems =
    concerts?.map((concert) => ({
      label: concert.name,
      value: concert.key,
    })) ?? [];

  const concertSelectItems = [
    { label: "All concerts", value: "all" },
    ...concertItems,
  ];

  const instrumentItems =
    instruments?.map((instrument) => ({
      label: instrument.name,
      value: instrument.key,
    })) ?? [];

  const instrumentSelectItems = [
    { label: "All instruments", value: "all" },
    ...instrumentItems,
  ];

  // Collect unique parts from the current version of each song.
  // Parts with the same key are considered the same; the first name found is used.
  const partsByKey = new Map<string, { label: string; value: string }>();

  songs?.forEach((song) => {
    const currentVersion = song.versions.find(
      (version) => version.song_version_id === song.current_version_id,
    );

    currentVersion?.parts.forEach((part) => {
      if (!partsByKey.has(part.key)) {
        partsByKey.set(part.key, {
          label: part.name,
          value: part.key,
        });
      }
    });
  });

  const partItems = Array.from(partsByKey.values());

  const partSelectItems = [{ label: "All parts", value: "all" }, ...partItems];

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
          <Collapsible>
            <div className="flex flex-col gap-4 md:flex-row md:gap-15">
              <div className="flex flex-1 flex-col gap-2">
                <div>Concert</div>
                <div>
                  <Select
                    items={concertSelectItems}
                    value={selectedConcert}
                    onValueChange={setSelectedConcert}
                  >
                    <SelectTrigger className="w-full min-w-72">
                      <SelectValue placeholder="Select a Concert" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All concerts</SelectItem>
                        <Separator className="my-1" />
                        {concertItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div>Instrument</div>
                <div>
                  <Select
                    items={instrumentSelectItems}
                    value={selectedInstrument}
                    onValueChange={setSelectedInstrument}
                  >
                    <SelectTrigger className="w-72">
                      <SelectValue placeholder="Select an instrument" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All instruments</SelectItem>
                        <Separator className="my-1" />
                        {instrumentItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <div>More options</div>
                <div className="flex h-9 items-center">
                  <CollapsibleTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="More options"
                        className="w-full hover:bg-transparent aria-expanded:bg-transparent"
                      />
                    }
                  >
                    <ChevronDown className="group-data-panel-open/button:rotate-180" />
                  </CollapsibleTrigger>
                </div>
              </div>
            </div>

            <CollapsibleContent>
              <div className="flex flex-col gap-4 mt-4 md:flex-row md:gap-15">
                <div className="flex flex-1 flex-col gap-2">
                  <div>Part</div>
                  <div>
                    <Select
                      items={partSelectItems}
                      value={selectedPart}
                      onValueChange={setSelectedPart}
                    >
                      <SelectTrigger className="w-72">
                        <SelectValue placeholder="Select a part" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All parts</SelectItem>
                          <Separator className="my-1" />
                          {partItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <span>Part vs Instrument?</span>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Part vs Instrument"
                            />
                          }
                        >
                          <Info />
                        </TooltipTrigger>

                        <TooltipContent className="max-w-64">
                          Parts vary between songs. Use Part if you can't find
                          what you're looking for with the Instrument selection.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <div>Include Score</div>
                  <div className="flex h-9 items-center">
                    <Checkbox
                      checked={includeScore}
                      onCheckedChange={setIncludeScore}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
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
