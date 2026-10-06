import { apiGet } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { SongResponse } from "@/core/types";

const log = createLogger("fetchSongs");

export interface SongFilters {
  archived?: boolean;
  search?: string;
  concert?: string;
  part?: string[];
  instrument?: string[];
  include_score?: boolean;
}

/**
 * Fetch songs from the library
 * @returns Songs with rich version data
 * @throws ApiError if the request fails
 */
export async function fetchSongs(
  filters: SongFilters = {},
): Promise<SongResponse[]> {
  const url = new URL(`${API_BASE_URL}/songs`);

  if (filters.archived !== undefined) {
    url.searchParams.set("archived", String(filters.archived));
  }

  if (filters.search) {
    url.searchParams.set("search", filters.search);
  }

  if (filters.concert) {
    url.searchParams.set("concert", filters.concert);
  }

  filters.part?.forEach((part) => {
    url.searchParams.append("part", part);
  });

  filters.instrument?.forEach((instrument) => {
    url.searchParams.append("instrument", instrument);
  });

  if (filters.include_score !== undefined) {
    url.searchParams.set("include_score", String(filters.include_score));
  }

  try {
    const songs = await apiGet<SongResponse[]>(url.toString());

    log.debug("raw payload: ", songs);

    return songs;
  } catch (error: unknown) {
    throw new ApiError(
      `Failed to fetch songs: ${(error as Error).message}`,
      url.toString(),
    );
  }
}
