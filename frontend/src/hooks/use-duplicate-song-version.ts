import { useMutation, useQueryClient } from "@tanstack/react-query";
import { duplicateSongVersion } from "@/services/song-version-service";

type DuplicateSongVersionParams = {
  songId: string;
  songVersionId: string;
};

export function useDuplicateSongVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, songVersionId }: DuplicateSongVersionParams) =>
      duplicateSongVersion(songId, songVersionId),
    onSuccess: async (_version, { songId } ) => {
      await queryClient.invalidateQueries({
        queryKey: ["songs", "byId", songId],
      });
    },
  });
}
