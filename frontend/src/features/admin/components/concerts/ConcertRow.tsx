import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pencil, Trash } from "lucide-react";
import type { ConcertDetailedResponse } from "@/core/types";

type ConcertRowProps = {
  concert: ConcertDetailedResponse;
  onEdit: (concert: ConcertDetailedResponse) => void;
  onDelete: (concert: ConcertDetailedResponse) => void;
};

export function ConcertRow({ concert, onEdit, onDelete }: ConcertRowProps) {
  function handleEditClick() {
    onEdit(concert);
  }

  function handleDeleteClick() {
    onDelete(concert);
  }

  return (
    <TableRow key={concert.id}>
      <TableCell>{concert.name}</TableCell>
      <TableCell>{concert.date}</TableCell>
      <TableCell>
        <ChevronDown className="ml-2 size-5" />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          className={"rounded-md"}
          onClick={handleEditClick}
        >
          <Pencil className="size-4" />
        </Button>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          className="rounded-md"
          onClick={handleDeleteClick}
        >
          <Trash className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
