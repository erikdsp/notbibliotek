import { apiGet, apiPost, apiPut } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { SongResponse, Song, SongVersion } from "@/core/types";

const log = createLogger("songsService");

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

    log.debug("url: ", url.toString(), "raw payload: ", songs);

    return songs;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch songs: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Fetch a song from the library
 * @returns Song with rich data for all its versions
 * @throws ApiError if the request fails
 */
export async function fetchSong(songId: string): Promise<SongResponse> {
  const url = new URL(`${API_BASE_URL}/songs/${songId}`);

  try {
    const song = await apiGet<SongResponse>(url.toString());

    log.debug("url: ", url.toString(), "raw payload: ", song);

    return song;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch song: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

/**
 * Create a song in the library
 * @returns Created song
 * @throws ApiError if the request fails
 */
export async function createSong(title: string): Promise<Song> {
  const url = new URL(`${API_BASE_URL}/songs`);

  try {
    const song = await apiPost<Song>(url.toString(), { title });

    log.debug("url: ", url.toString(), "raw payload: ", song);

    return song;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to create song: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}


/**
 * Update a song in the library
 * @returns Updated song
 * @throws ApiError if the request fails
 */
export async function updateSong(songId: string, title?: string, archive?: boolean): Promise<Song> {
  const url = new URL(`${API_BASE_URL}/songs/${songId}`);

  try {
    const song = await apiPut<Song>(url.toString(), { title, archive });

    log.debug("url: ", url.toString(), "raw payload: ", song);

    return song;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to update song: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}


/**
 * Create a song version
 * @returns Created song version
 * @throws ApiError if the request fails
 */
export async function createSongVersion(songId: string): Promise<SongVersion> {
  const url = new URL(`${API_BASE_URL}/songs/${songId}/versions`);

  try {
    const songVersion = await apiPost<SongVersion>(url.toString());

    log.debug("url: ", url.toString(), "raw payload: ", songVersion);

    return songVersion;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to create song version: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}
