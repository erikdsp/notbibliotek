import { useMutation } from "@tanstack/react-query";
import { fetchMultipleFiles, type DownloadFilesRequest } from "@/services/files-service";
import { downloadBlob } from "@/lib/download-blob";

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
