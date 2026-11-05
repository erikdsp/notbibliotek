import { useQuery } from "@tanstack/react-query";
import { fetchFile } from "@/services/files-service";

export function usePdfPreview(fileId: string | null) {
  return useQuery({
    queryKey: ["pdf-preview", fileId],
    queryFn: () => {
      if (fileId === null) {
        throw new Error("Missing file ID");
      }
      return fetchFile(fileId);
    },
    enabled: fileId !== null,
    staleTime: Infinity,
  });
}
