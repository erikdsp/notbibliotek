import { useMutation } from "@tanstack/react-query";
import { publishSongVersion } from "@/services/song-version-service";

type PublishSongVersionParams = {
  songId: string;
  versionId: string;
};

export function usePublishSongVersion() {
  return useMutation({
    mutationFn: ({ songId, versionId }: PublishSongVersionParams) =>
      publishSongVersion(songId, versionId),
  });
}
