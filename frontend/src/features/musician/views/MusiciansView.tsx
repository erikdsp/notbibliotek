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

const items = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

export function MusiciansView() {
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
          <div className="flex flex-col gap-4 md:flex-row md:gap-15">
            <div className="flex flex-1 flex-col gap-2">
              <div>Concert</div>
              <div>
                <Select items={concertSelectItems}>
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
                <Select items={instrumentSelectItems}>
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder="Select instruments" />
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

            <div className="flex flex-1 flex-col gap-2">
              <div>Part</div>
              <div>
                <Select items={items}>
                  <SelectTrigger className="w-45">
                    <SelectValue placeholder="Options" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {items.map((item) => (
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
              <div>Include Score</div>
              <div className="flex h-9 items-center">
                <Checkbox />
              </div>
            </div>
          </div>

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
