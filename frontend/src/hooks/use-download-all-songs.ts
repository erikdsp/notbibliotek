import { useMutation } from "@tanstack/react-query";
import { downloadBlob } from "@/lib/download-blob";
import {
  fetchAllSongFilesAsZip,
  type DownloadAllSongsRequest,
} from "@/services/songs-service";

type DownloadAllSongsParams = {
  request: DownloadAllSongsRequest;
};

export function useDownloadAllSongs() {
  return useMutation({
    mutationFn: async ({ request }: DownloadAllSongsParams) => {
      const { blob, fileName } = await fetchAllSongFilesAsZip(request);
      downloadBlob(blob, fileName);
    },
  });
}
