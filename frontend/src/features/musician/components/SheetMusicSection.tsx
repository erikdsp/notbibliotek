import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ConcertDetailedResponse, SongResponse } from "@/core/types";
import type { FileMetadata } from "@/core/types/file";
import { formatDateTime } from "@/utils/format-time";
import { Download } from "lucide-react";

type SheetMusicSectionProps = {
  songs: SongResponse[];
  selectedConcertDetails: ConcertDetailedResponse | undefined;
  showDetailedList: boolean;
  concertSelected: boolean;
  instrumentSelected: boolean;
  isDownloading: boolean;
  onDownload: (file: FileMetadata) => void;
};

export function SheetMusicSection({
  songs,
  selectedConcertDetails,
  showDetailedList,
  concertSelected,
  instrumentSelected,
  isDownloading,
  onDownload,
}: SheetMusicSectionProps) {
  return (
    <section
      className={`flex flex-col items-center w-full ${showDetailedList ? "max-w-4xl" : "max-w-2xl"}`}
    >
      <div className={`w-full rounded-lg border p-6`}>
        <h2 className="text-2xl font-bold mb-4">
          {selectedConcertDetails
            ? selectedConcertDetails.name
            : "All Songs in the Library"}{" "}
        </h2>
        {selectedConcertDetails && (
          <p className="mb-2">{selectedConcertDetails.date}</p>
        )}
        <Table className="w-full">
          <TableHeader className="border-b-2">
            <TableRow className=" text-base">
              <TableHead className="w-60 font-normal">Song</TableHead>
              <TableHead className="font-normal">
                {" "}
                {showDetailedList && "Parts"}{" "}
              </TableHead>
              <TableHead className="w-25 font-normal">Version</TableHead>
              {showDetailedList && (
                <TableHead className="w-14 pl-8 font-normal"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.map((song) => {
              const currentVersion = song.versions.find(
                (version) =>
                  version.song_version_id === song.current_version_id,
              );

              if (!currentVersion) {
                return (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">{song.title}</TableCell>
                    <TableCell className="italic"></TableCell>
                    <TableCell className="italic">
                      No published version
                    </TableCell>
                  </TableRow>
                );
              }

              if (currentVersion.parts.length === 0 || !showDetailedList) {
                return (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">{song.title}</TableCell>
                    <TableCell className="italic">
                      {instrumentSelected && "Missing"}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(currentVersion.published_at)}
                    </TableCell>
                  </TableRow>
                );
              }

              return currentVersion.parts.map((part, partIndex) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">
                    {partIndex === 0 ? song.title : null}
                  </TableCell>

                  <TableCell>{part.name}</TableCell>

                  <TableCell>
                    {partIndex === 0
                      ? formatDateTime(currentVersion.published_at)
                      : null}
                  </TableCell>
                  <TableCell className="pl-8">
                    <Button
                      variant="secondary"
                      disabled={isDownloading}
                      onClick={() => onDownload(part.file)}
                    >
                      <Download /> Download PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </div>
      <div className="pt-6 flex flex-1 flex-col items-center gap-4">
        {concertSelected && (
          <Button variant="outline" disabled>
            <Download /> Download Set List
          </Button>
        )}
        {showDetailedList && (
          <Button disabled>
            <Download /> Download Sheet Music{" "}
            {concertSelected && "and Set List"} (.zip)
          </Button>
        )}
      </div>
    </section>
  );
}
