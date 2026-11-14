import { useMutation } from "@tanstack/react-query";
import { fetchMultipleFiles } from "@/services/files-service";
import { downloadBlob } from "@/lib/download-blob";
import type { DownloadFilesRequest } from "@/core/types/requests";

type DownloadMultipleFilesParams = {
  request: DownloadFilesRequest;
  instrumentName?: string;
};

export function useDownloadMultipleFiles() {
  return useMutation({
    mutationFn: async ({
      request,
      instrumentName,
    }: DownloadMultipleFilesParams) => {
      const { blob, fileName } = await fetchMultipleFiles(request);
      const downloadName = instrumentName ? `${instrumentName}-${fileName}` : fileName
      downloadBlob(blob, downloadName);
    },
  });
}
