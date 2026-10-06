import { useQuery } from "@tanstack/react-query";
import { fetchConcerts } from "@/services/concerts-service"

export function useConcerts() {
  return useQuery({
    queryKey: ["concerts"],
    queryFn: () => fetchConcerts(),
    staleTime: Infinity,
  });
}
