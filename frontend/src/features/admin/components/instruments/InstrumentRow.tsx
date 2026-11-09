import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Instrument } from "@/core/types";

type InstrumentRowProps = {
  instrument: Instrument;
  onEdit: (instrument: Instrument) => void;
  onDelete: (instrument: Instrument) => void;
};

export function InstrumentRow({
  instrument,
  onEdit,
  onDelete,
}: InstrumentRowProps) {
  return (
    <TableRow>
      <TableCell>{instrument.name}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          className={"rounded-md"}
          onClick={() => onEdit(instrument)}
        >
          <Pencil className="size-4" />
        </Button>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          className="rounded-md"
          onClick={() => onDelete(instrument)}
        >
          <Trash className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
