import { apiGet } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";

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
