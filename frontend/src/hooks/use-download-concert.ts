import { useMutation } from "@tanstack/react-query";
import { downloadBlob } from "@/lib/download-blob";
import { fetchConcertFilesAsZip, type DownloadConcertRequest } from "@/services/concerts-service";

type DownloadConcertParams = {
  request: DownloadConcertRequest;
};

export function useDownloadConcert() {
  return useMutation({
    mutationFn: async ({
      request,
    }: DownloadConcertParams) => {
      const { blob, fileName } = await fetchConcertFilesAsZip(request);
      downloadBlob(blob, fileName);
    },
  });
}
