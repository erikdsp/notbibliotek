import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ConcertDetailedResponse } from "@/core/types";
import { ConcertEditor } from "@/features/admin/components/ConcertEditor";
import { useConcerts, useSongs } from "@/hooks";
import { createLogger } from "@/utils/logger";
import { ChevronDown, Pencil, Plus, Trash } from "lucide-react";
import { useState } from "react";

const log = createLogger("ConcertsTab");

export function ConcertsTab() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingConcert, setEditingConcert] = useState<ConcertDetailedResponse | null>(
    null,
  );
  const {
    data: concerts,
    isLoading: concertsIsLoading,
    error: concertsError,
  } = useConcerts();

  const {
    data: songs,
    isLoading: songsIsLoading,
    error: songsError,
  } = useSongs();

  function handleAdd() {
    setEditingConcert(null);
    setEditorOpen(true);
  }

  function handleEdit(concert: ConcertDetailedResponse) {
    setEditingConcert(concert);
    setEditorOpen(true);
  }

  if (concertsIsLoading || songsIsLoading) {
    return <div>Loading...</div>;
  }

  if (concertsError) {
    log.error(concertsError);
    return <div>Failed to load concerts.</div>;
  }

  if (songsError) {
    log.error(songsError);
    return <div>Failed to load songs.</div>;
  }

  const safeConcerts = concerts ?? [];
  const safeSongs = songs ?? [];

  log.debug("Concerts Tab");

  return (
    <section className="mx-auto max-w-4xl rounded-lg">
      <Button variant="outline" className="mx-auto flex" onClick={handleAdd}>
        <Plus />
        Add Concert
      </Button>

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
            {safeConcerts.map((concert) => (
              <TableRow key={concert.id}>
                <TableCell>{concert.name}</TableCell>
                <TableCell>{concert.date}</TableCell>
                <TableCell>
                  {" "}
                  <ChevronDown className="ml-2 size-5" />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className={"rounded-md"}
                    onClick={() => handleEdit(concert)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="rounded-md"
                    // onClick={() => handleDelete(concert)}
                  >
                    <Trash className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editorOpen && (
        <ConcertEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          editingConcert={editingConcert}
          concerts={safeConcerts}
          songs={safeSongs}
        />
      )}
    </section>
  );
}
