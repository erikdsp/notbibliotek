import { TableHead, TableRow } from "@/components/ui/table";

export function SongTableHeadRow() {
  return (
    <TableRow className=" text-base">
      <TableHead />
      <TableHead />
      <TableHead />
      <TableHead className="w-14 pl-8 font-normal"></TableHead>
    </TableRow>
  );
}
