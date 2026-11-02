import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { Instrument } from "@/core/types";

const log = createLogger("instruments-service");

/**
 * Fetch instruments from the library
 * @returns Instruments
 * @throws ApiError if the request fails
 */
export async function fetchInstruments(): Promise<Instrument[]> {
  const url = new URL(`${API_BASE_URL}/instruments`);

  try {
    const instruments = await apiGet<Instrument[]>(url.toString());

    log.debug("raw payload: ", instruments);

    return instruments;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch instruments: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Create an instrument in the library
 * @returns Created instrument
 * @throws ApiError if the request fails
 */
export async function createInstrument(name: string, key: string): Promise<Instrument> {
  const url = new URL(`${API_BASE_URL}/instruments`);

  try {
    const instrument = await apiPost<Instrument>(url.toString(), { name, key });

    log.debug("url: ", url.toString(), "raw payload: ", instrument);

    return instrument;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to create instrument: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}


/**
 * Update an instrument in the library
 * @returns Updated instrument
 * @throws ApiError if the request fails
 */
export async function updateInstrument(instrumentId: string, name?: string, key?: string): Promise<Instrument> {
  const url = new URL(`${API_BASE_URL}/instruments/${instrumentId}`);

  try {
    const instrument = await apiPatch<Instrument>(url.toString(), { name, key });

    log.debug("url: ", url.toString(), "raw payload: ", instrument);

    return instrument;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to update instrument: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}


/**
 * Delete an instrument from the library
 * @returns Promise<void>
 * @throws ApiError if the request fails
 */
export async function deleteInstrument(instrumentId: string): Promise<void> {
  const url = new URL(`${API_BASE_URL}/instruments/${instrumentId}`);

  try {
    await apiDelete<void>(url.toString() );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to delete instrument: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}