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
import { ChevronDown, Pencil, Plus, Trash } from "lucide-react";

const log = createLogger("ConcertsTab");

export function ConcertsTab() {
  log.debug("Concerts Tab");

  return (
    <section className="mx-auto max-w-4xl rounded-lg">
      <Button variant="outline" className="mx-auto flex">
        <Plus />
        Add Concert
      </Button>

      <div className="rounded-lg border p-1 mt-4 ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Songs</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow key={123}>
              <TableCell>Oceanen</TableCell>
              <TableCell>2026-10-23</TableCell>
              <TableCell className="italic">oceanen26</TableCell>
              <TableCell>
                <ChevronDown className="ml-2 size-5" />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  className={"rounded-md"}
                  aria-label="edit"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  className={"rounded-md"}
                  aria-label="delete"
                >
                  <Trash className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow key={456}>
              <TableCell className="italic"></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
