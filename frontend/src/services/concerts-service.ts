import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { ConcertDetailedResponse, ConcertResponse } from "@/core/types";

const log = createLogger("concerts-service");

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

/**
 * Create a concert in the library
 * @returns Created concert
 * @throws ApiError if the request fails
 */
export async function createConcert(
  name: string,
  key: string,
  date: string,
): Promise<ConcertResponse> {
  const url = new URL(`${API_BASE_URL}/concerts`);

  try {
    const concert = await apiPost<ConcertResponse>(url.toString(), {
      name,
      key,
      date,
    });

    log.debug("url: ", url.toString(), "raw payload: ", concert);

    return concert;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to create concert: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Update a concert in the library
 * @returns Updated concert
 * @throws ApiError if the request fails
 */
export async function updateConcert(
  concertId: string,
  name?: string,
  date?: string,
): Promise<ConcertResponse> {
  const url = new URL(`${API_BASE_URL}/concerts/${concertId}`);

  try {
    const concert = await apiPatch<ConcertResponse>(url.toString(), {
      name,
      date,
    });

    log.debug("url: ", url.toString(), "raw payload: ", concert);

    return concert;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to update concert: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Delete a concert from the library
 * @returns Promise<void>
 * @throws ApiError if the request fails
 */
export async function deleteConcert(concertId: string): Promise<void> {
  const url = new URL(`${API_BASE_URL}/concerts/${concertId}`);

  try {
    await apiDelete<void>(url.toString());
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to delete concert: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}
