import type { Instrument } from "@/core/types";
import type { EditablePart } from "@/features/admin/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { PublishPartRow } from "@/features/admin/components/songs/editor/dialogs";

type PublishPartsSummaryProps = {
  parts: EditablePart[] | null;
  instruments: Instrument[];
};

export function PublishPartsSummary({
  parts,
  instruments,
}: PublishPartsSummaryProps) {
  const numberOfParts = parts?.length ?? 0;
  return (
    <section className="space-y-2">
      <h3 className="px-3 text-sm font-semibold">Parts ({numberOfParts})</h3>

      <div className="overflow-x-auto">
        <Table className="w-full text-left text-sm">
          <TableHeader className="bg-muted/50">
            <TableRow className="border-b">
              <TableHead className="px-3 py-2 font-medium">Name</TableHead>
              <TableHead className="px-3 py-2 font-medium">Instruments</TableHead>
              <TableHead className="px-3 py-2 font-medium">File</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {parts?.map((part) => (
              <PublishPartRow
                key={part.local_id}
                part={part}
                instruments={instruments}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
