import { useQuery } from "@tanstack/react-query";
import { fetchPartInstruments } from "@/services/part-instruments-service";

export function usePartInstruments(
  songId: string | null,
  versionId: string | null,
) {
  return useQuery({
    queryKey: ["part-instruments", songId, versionId],
    queryFn: () => {
      if (songId === null || versionId === null) {
        throw new Error("Song ID and version ID are required");
      }

      return fetchPartInstruments(songId, versionId);
    },
    enabled: songId !== null && versionId !== null,
  });
}
