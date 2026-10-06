import { apiGet } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { Instrument } from "@/core/types";

const log = createLogger("fetchInstruments");

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
    throw new ApiError(
      `Failed to fetch instruments: ${(error as Error).message}`,
      url.toString(),
    );
  }
}
