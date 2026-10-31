import { useState } from "react";
import { InstrumentEditor } from "./InstrumentEditor";
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
import { useInstruments } from "@/hooks";

const log = createLogger("InstrumentsTab");

export function InstrumentsTab() {
  const [editorOpen, setEditorOpen] = useState(false);
  const {
    data: instruments,
    isLoading: instrumentsIsLoading,
    error: instrumentsError,
  } = useInstruments();

  if (instrumentsIsLoading) {
    return <div>Loading...</div>;
  }

  if (instrumentsError) {
    log.error(instrumentsError);
    return <div>Failed to load instruments.</div>;
  }

  const safeInstruments = instruments ?? [];

  return (
    <section className="mx-auto max-w-xl rounded-lg">
      <Button
        variant="outline"
        className="mx-auto flex"
        onClick={() => setEditorOpen(true)}
      >
        <Plus />
        Add Instrument
      </Button>
      <div className="rounded-lg border p-1 mt-4">
        <Table>
          <TableHeader className="border-b-2">
            <TableRow className="text-base">
              <TableHead className="font-normal">Name</TableHead>
              <TableHead className="font-normal">Key</TableHead>
              <TableHead className="font-normal w-2"></TableHead>
              <TableHead className="font-normal w-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeInstruments.map((instrument) => (
              <TableRow key={instrument.id}>
                <TableCell>{instrument.name}</TableCell>
                <TableCell className="italic">{instrument.key}</TableCell>
                <TableCell>
                  <Button variant="ghost" className={"rounded-md"}>
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" className={"rounded-md"}>
                    <Trash className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editorOpen && (
        <InstrumentEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          editingInstrument={null}
          instruments={safeInstruments}
        />
      )}
    </section>
  );
}
