import { apiDelete, apiGet, apiPost } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { PartInstruments } from "@/core/types";

const log = createLogger("partInstrumentsService");

/**
 * Fetch part instrument connections from the library
 * @returns PartInstruments[]
 * @throws ApiError if the request fails
 */
export async function fetchPartInstruments(
  songId: string,
  versionId: string,
): Promise<PartInstruments[]> {
  const url = new URL(
    `${API_BASE_URL}/songs/${songId}/versions/${versionId}/instruments`,
  );

  try {
    const partInstruments = await apiGet<PartInstruments[]>(url.toString());

    log.debug("raw payload: ", partInstruments);

    return partInstruments;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch part instruments: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Create part instrument connection in the library
 * @returns void
 * @throws ApiError if the request fails
 */
export async function createPartInstrumentConnection(
  partId: string,
  instrumentId: string,
): Promise<void> {
  const url = new URL(
    `${API_BASE_URL}/parts/${partId}/instruments/${instrumentId}`,
  );

  try {
    await apiPost<void>(url.toString());
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to create part instrument connection: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Delete part instrument connection from the library
 * @returns void
 * @throws ApiError if the request fails
 */
export async function deletePartInstrumentConnection(
  partId: string,
  instrumentId: string,
): Promise<void> {
  const url = new URL(
    `${API_BASE_URL}/parts/${partId}/instruments/${instrumentId}`,
  );

  try {
    await apiDelete<void>(url.toString());
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to delete part instrument connection: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}
