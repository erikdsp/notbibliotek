import { apiGet } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { ConcertDetailedResponse } from "@/core/types";

const log = createLogger("fetchConcerts");

/**
 * Fetch concerts from the library
 * @returns Concerts with included songs
 * @throws ApiError if the request fails
 */
export async function fetchConcerts(): Promise<ConcertDetailedResponse[]> {
  const url = new URL(`${API_BASE_URL}/concerts`);

  try {
    const concerts = await apiGet<ConcertDetailedResponse[]>(url.toString());

    log.debug("raw payload: ", concerts);

    return concerts;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch concerts: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}
