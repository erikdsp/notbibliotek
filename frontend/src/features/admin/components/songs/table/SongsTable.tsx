import type { SongResponse } from "@/core/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSongVersion } from "@/utils";
import { Pencil } from "lucide-react";

type SongsTableProps = {
  songs: SongResponse[];
  openEditor: (songId: string | null) => void;
};

export function SongsTable({ songs, openEditor }: SongsTableProps) {
  return (
    <div className="mt-4 rounded-lg border p-1">
      <Table className="table-fixed">
        <TableHeader className="border-b-2">
          <TableRow className="text-base">
            <TableHead className="w-[55%] font-normal">Title</TableHead>
            <TableHead className="font-normal">Current Version</TableHead>
            <TableHead className="w-20 text-right font-normal ">Edit</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {songs.map((song) => (
            <TableRow key={song.id}>
              <TableCell className="font-medium">{song.title}</TableCell>
              <TableCell>
                {formatSongVersion(song, song.current_version_id) ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${song.title}`}
                  onClick={() => openEditor(song.id)}
                >
                  <Pencil className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
