import { useQuery } from "@tanstack/react-query";
import { fetchInstruments } from "@/services/instruments-service"

export function useInstruments() {
  return useQuery({
    queryKey: ["instruments"],
    queryFn: () => fetchInstruments(),
    staleTime: Infinity,
  });
}
