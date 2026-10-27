import { apiDelete, apiPost, apiPut } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type {
  ScoreResponse,
} from "@/core/types/song-version-responses";

const log = createLogger("songVersionService");

/**
 * Post score to the library
 * @returns Promise<ScoreResponse>
 * @throws ApiError if the request fails
 */
export async function uploadScore(
  songId: string,
  versionId: string,
  file: File,
): Promise<ScoreResponse> {
  const url = new URL(
    `${API_BASE_URL}/songs/${songId}/versions/${versionId}/score`,
  );

  try {
    const formData = new FormData();
    formData.append("file", file);

    const score = await apiPost<ScoreResponse>(url.toString(), formData);

    log.debug("raw payload: ", score);

    return score;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to upload score: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Update score in the library
 * @returns Promise<ScoreResponse>
 * @throws ApiError if the request fails
 */
export async function updateScore(
  songId: string,
  versionId: string,
  file: File,
): Promise<ScoreResponse> {
  const url = new URL(
    `${API_BASE_URL}/songs/${songId}/versions/${versionId}/score`,
  );

  try {
    const formData = new FormData();
    formData.append("file", file);

    const score = await apiPut<ScoreResponse>(url.toString(), formData);

    log.debug("raw payload: ", score);

    return score;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to update score: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Delete score from the library
 * @returns void
 * @throws ApiError if the request fails
 */
export async function deleteScore(
  songId: string,
  versionId: string,
): Promise<void> {
  const url = new URL(
    `${API_BASE_URL}/songs/${songId}/versions/${versionId}/score`,
  );

  try {
    await apiDelete<void>(url.toString());
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to delete score: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}
