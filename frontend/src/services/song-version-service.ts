import { apiDelete, apiPatch, apiPost, apiPut } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type {
  PartResponse,
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

/**
 * Post part to the library
 * @returns Promise<PartResponse>
 * @throws ApiError if the request fails
 */
export async function uploadPart(
  songId: string,
  versionId: string,
  key: string,
  name: string,
  file: File,
): Promise<PartResponse> {
  const url = new URL(
    `${API_BASE_URL}/songs/${songId}/versions/${versionId}/parts`,
  );

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("key", key);
    formData.append("file", file);

    const part = await apiPost<PartResponse>(url.toString(), formData);
    log.debug("raw payload: ", part);
    return part;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to upload part: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

type updatePartParams = {
  partId: string;
  name?: string;
  key?: string;
  file?: File;
};

/**
 * Update a part in the library
 * @returns Promise<PartResponse>
 * @throws ApiError if the request fails
 */
export async function updatePart({
  partId,
  name,
  key,
  file,
}: updatePartParams): Promise<PartResponse> {
  const url = new URL(`${API_BASE_URL}/parts/${partId}`);

  try {
    const formData = new FormData();
    if (name !== undefined) formData.append("name", name);
    if (key !== undefined) formData.append("key", key);
    if (file !== undefined) formData.append("file", file);

    const part = await apiPatch<PartResponse>(url.toString(), formData);
    log.debug("raw payload: ", part);
    return part;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to update part: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Delete a part from the library
 * @returns Promise<void>
 * @throws ApiError if the request fails
 */
export async function deletePart(partId: string): Promise<void> {
  const url = new URL(`${API_BASE_URL}/parts/${partId}`);

  try {
    await apiDelete<void>(url.toString());
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to delete part: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}
