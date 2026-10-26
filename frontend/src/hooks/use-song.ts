import { useQuery } from "@tanstack/react-query";
import { fetchSong } from "@/services/songs-service";

export function useSong(songId: string | null) {
  return useQuery({
    queryKey: ["songs", "byId" ,songId],
    queryFn: () => {
      if (songId === null) {
        throw new Error("songId is required");
      }
      return fetchSong(songId);
    },
    enabled: songId !== null,
    staleTime: Infinity,
  });
}
