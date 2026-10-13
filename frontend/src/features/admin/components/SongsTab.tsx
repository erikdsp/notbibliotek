import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createLogger } from "@/utils/logger";
import { ChevronUp, CopyPlus, Pencil, Plus } from "lucide-react";

const log = createLogger("SongsTab");

export function SongsTab() {
  log.debug("Songs Tab");

  return (
    <section className="mx-auto max-w-4xl rounded-lg">
      <Button variant="outline" className="mx-auto flex">
        <Plus />
        Add Song
      </Button>

      <div className="rounded-lg border p-1 mt-4 ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Versions</TableHead>
              <TableHead className="version-actions">Edit Versions</TableHead>
              <TableHead className="song-actions">Edit Song</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow key={123}>
              <TableCell className="font-medium">Water Song</TableCell>
              <TableCell>
                <>
                  2026-10-13 10:15
                  <span className="ml-4 font-medium">(Current)</span>
                </>
              </TableCell>
              <TableCell>
                <ChevronUp className="ml-8" />
              </TableCell>
              <TableCell>
                {" "}
                <Button variant="ghost" className={"rounded-md"}>
                  <Pencil className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow key="versionid2">
              <TableCell></TableCell>
              <TableCell className="text-xs">
                <span>2026-10-12 22:30</span>
                <span className="ml-4">(Draft)</span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" className={"rounded-md"}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" className="rounded-md">
                  <CopyPlus className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow key="versionid1">
              <TableCell></TableCell>
              <TableCell className="text-xs">
                <span>2026-10-13 10:15</span>
                <span className="ml-4 font-medium">(Current)</span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" className={"rounded-md"}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" className="rounded-md">
                  <CopyPlus className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow key="versionid3">
              <TableCell></TableCell>
              <TableCell className="text-xs">
                <span>2026-09-25 16:05</span>
                <span className="ml-4 font-medium"></span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" className="rounded-md">
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" className="rounded-md">
                  <CopyPlus className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow key="songid-new-version">
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>
                {" "}
                <Button variant="outline" className="flex" size="sm">
                  <Plus />
                  New Version
                </Button>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow key={456}>
              <TableCell className="font-medium">Mist</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>
                {" "}
                <Button variant="ghost" className={"rounded-md"}>
                  <Pencil className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
