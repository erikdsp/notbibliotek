import type { DownloadAllSongsRequest } from "@/services/songs-service";

export function getDownloadAllSongsRequest(
  instrumentKeys: string[] | undefined,
  includeUnconnectedParts: boolean,
): DownloadAllSongsRequest {
  const result: DownloadAllSongsRequest = {
    instrumentKeys,
    includeUnconnectedParts: includeUnconnectedParts ?? undefined,
  };

  return result;
}
