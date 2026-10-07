import { apiGet } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { ConcertResponse } from "@/core/types";

const log = createLogger("fetchConcerts");

/**
 * Fetch concerts from the library
 * @returns Concerts with included songs
 * @throws ApiError if the request fails
 */
export async function fetchConcerts(): Promise<ConcertResponse[]> {
  const url = new URL(`${API_BASE_URL}/concerts`);

  try {
    const concerts = await apiGet<ConcertResponse[]>(url.toString());

    log.debug("raw payload: ", concerts);

    return concerts;
  } catch (error: unknown) {
    throw new ApiError(
      `Failed to fetch concerts: ${(error as Error).message}`,
      url.toString(),
    );
  }
}
