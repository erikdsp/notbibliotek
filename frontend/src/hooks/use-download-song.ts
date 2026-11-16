import { useMutation } from "@tanstack/react-query";
import { downloadBlob } from "@/lib/download-blob";
import { fetchSongFilesAsZip } from "@/services/songs-service";

export function useDownloadSong() {
  return useMutation({
    mutationFn: async (songId: string) => {
      const { blob, fileName } = await fetchSongFilesAsZip(songId);
      downloadBlob(blob, fileName);
    },
  });
}
