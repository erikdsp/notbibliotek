import { useState } from "react";
import { InstrumentDialog } from "./InstrumentDialog";
import { Plus, Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createLogger } from "@/utils/logger";
import { Button } from "@/components/ui/button";

const log = createLogger("InstrumentsTab");

export function InstrumentsTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  log.debug("Instruments Tab");

  return (
    <section className="mx-auto max-w-lg rounded-lg">
      <Button
        variant="outline"
        className="mx-auto flex"
        onClick={() => setDialogOpen(true)}
      >
        <Plus />
        Add Instrument
      </Button>
      <div className="rounded-lg border p-1 mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow key={123}>
              <TableCell>Violin 1</TableCell>
              <TableCell className="italic">violin1</TableCell>
              <TableCell>
                <Button variant="ghost" className={"rounded-md"}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" className={"rounded-md"}>
                  <Trash className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow key={456}>
              <TableCell className="italic"></TableCell>
              <TableCell></TableCell>
              <TableCell>
                <Button variant="ghost" className={"rounded-md"}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" className={"rounded-md"}>
                  <Trash className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <InstrumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingInstrument={null}
      />
    </section>
  );
}
