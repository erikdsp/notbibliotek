import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ConcertDetailedResponse } from "@/core/types";
import { ConcertRow } from "@/features/admin/components/concerts/ConcertRow";

type ConcertsTableProps = {
  concerts: ConcertDetailedResponse[];
  onEdit: (concert: ConcertDetailedResponse) => void;
  onDelete: (concert: ConcertDetailedResponse) => void;
};

export function ConcertsTable({
  concerts,
  onEdit,
  onDelete,
}: ConcertsTableProps) {
  return (
    <div className="rounded-lg border p-1 mt-4 ">
      <Table>
        <TableHeader className="border-b-2">
          <TableRow className="text-base">
            <TableHead className="font-normal">Name</TableHead>
            <TableHead className="font-normal">Date</TableHead>
            <TableHead className="font-normal w-50">Songs</TableHead>
            <TableHead className="font-normal w-2"></TableHead>
            <TableHead className="font-normal w-2"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {concerts.map((concert) => (
            <ConcertRow concert={concert} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
