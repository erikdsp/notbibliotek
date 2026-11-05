import { TableHead, TableRow } from "@/components/ui/table";

type SetlistTableHeadRowProps = {
  showDetailedList: boolean;
};

export function SetlistTableHeadRow({
  showDetailedList,
}: SetlistTableHeadRowProps) {
  return showDetailedList ? (
    <TableRow className=" text-base">
      <TableHead className={`font-normal w-60`}>Song</TableHead>
      <TableHead className="font-normal">Parts</TableHead>
      <TableHead className={`font-normal w-25`}>Version</TableHead>
      <TableHead className="w-14 pl-8 font-normal"></TableHead>
    </TableRow>
  ) : (
    <TableRow className=" text-base">
      <TableHead className={`font-normal w-60`}>Song</TableHead>
      <TableHead></TableHead>
      <TableHead className={`font-normal w-25`}>Version</TableHead>
      <TableHead></TableHead>
    </TableRow>
  );
}
