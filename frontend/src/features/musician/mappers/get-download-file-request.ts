import type { SongResponse } from "@/core/types";
import { getCurrentVersion } from "@/features/musician/lib/get-current-version";
import type { DownloadFilesRequest } from "@/services/files-service";

export function getDownloadFileRequest(songs: SongResponse[]): DownloadFilesRequest {
  const request: DownloadFilesRequest = { files: [] };

  for (const song of songs) {
    const currentVersion = getCurrentVersion(song);

    if (!currentVersion) continue;

    for (const part of currentVersion.parts) {
      request.files.push({ file_id: part.file.id });
    }
  }

  return request;
}
