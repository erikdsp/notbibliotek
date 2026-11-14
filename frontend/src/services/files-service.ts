import { apiGet, apiPost } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { DownloadFilesRequest } from "@/core/types/requests";
import { parseFileResponse, type DownloadedFile } from "@/lib/parse-file-response";

const log = createLogger("files-service");

/**
 * Fetch file from the library
 * @returns Promise<Blob>
 * @throws ApiError if the request fails
 */
export async function fetchFile(fileId: string): Promise<Blob> {
  const url = new URL(`${API_BASE_URL}/files/${fileId}/download`);

  try {
    const file = await apiGet<Blob>(
        url.toString(), 
        (response) => response.blob(),
    );

    log.debug("fetched file: ", file);

    return file;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch file: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}


/**
 * Fetch multiple files as a ZIP archive from the library
 * @returns Promise<Blob>
 * @throws ApiError if the request fails
 */
export async function fetchMultipleFiles(
  request: DownloadFilesRequest,
): Promise<DownloadedFile> {
  const url = new URL(`${API_BASE_URL}/files/download`);

  try {
    const file = await apiPost<DownloadedFile>(
      url.toString(),
      request,
      parseFileResponse,
    );

    return file;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch zip file: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}