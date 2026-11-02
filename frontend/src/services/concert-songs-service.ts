import { apiDelete, apiPost } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";

/**
 * Create concert song connection in the library
 * @returns void
 * @throws ApiError if the request fails
 */
export async function createConcertSongConnection(
  concertId: string,
  songId: string,
): Promise<void> {
  const url = new URL(
    `${API_BASE_URL}/concerts/${concertId}/songs/${songId}`,
  );

  try {
    await apiPost<void>(url.toString());
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to create concert song connection: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Delete concert song connection from the library
 * @returns void
 * @throws ApiError if the request fails
 */
export async function deleteConcertSongConnection(
  concertId: string,
  songId: string,
): Promise<void> {
  const url = new URL(
    `${API_BASE_URL}/concerts/${concertId}/songs/${songId}`,
  );

  try {
    await apiDelete<void>(url.toString());
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to delete concert song connection: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}
