import { useMutation } from "@tanstack/react-query";
import { fetchFile } from "@/services/files-service";
import { downloadBlob } from "@/lib/download-blob";

type DownloadFileParams = {
  fileId: string;
  fileName: string;
};

export function useDownloadFile() {
  return useMutation({
    mutationFn: async ({ fileId, fileName }: DownloadFileParams) => {
      const blob = await fetchFile(fileId);
      downloadBlob(blob, fileName);
    },
  });
}