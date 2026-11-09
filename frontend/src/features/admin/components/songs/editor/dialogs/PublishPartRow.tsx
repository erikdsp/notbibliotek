import { AlertTriangle } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Instrument } from "@/core/types";
import type { EditablePart } from "@/features/admin/types";

type PublishPartRowProps = {
  part: EditablePart;
  instruments: Instrument[];
};

function formatInstrumentNames(
  instrumentIds: string[],
  instruments: Instrument[],
): string {
  return instrumentIds
    .map((id) => instruments.find((instrument) => instrument.id === id)?.name)
    .filter((name): name is string => name !== undefined)
    .join(", ");
}

export function PublishPartRow({
  part,
  instruments,
}: PublishPartRowProps) {
  const instrumentNames = formatInstrumentNames(part.instrument_ids, instruments);
  const hasInstruments = instrumentNames.length > 0;
  const fileName = part.file_name ?? "—";

  return (
    <TableRow className="border-b last:border-0">
      <TableCell className="px-3 py-2">{part.name}</TableCell>

      <TableCell className="px-3 py-2">
        {hasInstruments ? (
          instrumentNames
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-amber-600" />
            None
          </span>
        )}
      </TableCell>

      <TableCell className="max-w-48 truncate px-3 py-2">
        {fileName}
      </TableCell>
    </TableRow>
  );
}