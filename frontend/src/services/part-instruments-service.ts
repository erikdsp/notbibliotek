import { apiGet } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { PartInstruments } from "@/core/types";

const log = createLogger("fetchPartInstruments");

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
    throw new ApiError(
      `Failed to fetch part instruments: ${(error as Error).message}`,
      url.toString(),
    );
  }
}
