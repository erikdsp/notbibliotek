import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSongVersion } from "@/services/songs-service";

export function useCreateSongVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) => createSongVersion(songId),
    onSuccess: async (_version, songId) => {
      await queryClient.invalidateQueries({
        queryKey: ["songs", "byId", songId],
      });
    },
  });
}