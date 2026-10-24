import { useQuery } from "@tanstack/react-query";
import { fetchSongs, type SongFilters, } from "@/services/songs-service"

export function useSongs(filters: SongFilters = {}) {
  return useQuery({
    queryKey: ["songs", "list", filters],
    queryFn: () => fetchSongs(filters),
    staleTime: Infinity,
  });
}
