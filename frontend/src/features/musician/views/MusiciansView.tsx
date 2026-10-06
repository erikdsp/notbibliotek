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

const items = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

export function MusiciansView() {
  const { data: songs, isLoading, isError } = useSongs();

  if (isLoading) {
    return <div>Loading songs...</div>;
  }

  if (isError) {
    return <div>Failed to load songs.</div>;
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
          <div className="flex flex-col gap-4 md:flex-row md:gap-15">
            <div className="flex flex-1 flex-col gap-2">
              <div>Concert</div>
              <div>
                <Select items={items}>
                  <SelectTrigger className="w-full md:w-45">
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

            <div className="flex flex-1 flex-col gap-2">
              <div>Instrument</div>
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
