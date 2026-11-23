import { apiGet, apiPatch, apiPost } from "@/lib";
import { ApiError } from "@/errors";
import { API_BASE_URL } from "@/config";
import { createLogger } from "@/utils/logger";
import type { SongResponse, Song } from "@/core/types";
import {
  parseFileResponse,
  type DownloadedFile,
} from "@/lib/parse-file-response";

const log = createLogger("songsService");

export interface SongFilters {
  include_archived?: boolean;
  search?: string;
  concert?: string;
  part?: string[];
  instrument?: string[];
  include_unconnected_parts?: boolean;
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

  if (filters.include_archived !== undefined) {
    url.searchParams.set("include_archived", String(filters.include_archived));
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

  if (filters.include_unconnected_parts !== undefined) {
    url.searchParams.set(
      "include_unconnected_parts",
      String(filters.include_unconnected_parts),
    );
  }

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
export async function updateSong(
  songId: string,
  title?: string,
  archived?: boolean,
): Promise<Song> {
  const url = new URL(`${API_BASE_URL}/songs/${songId}`);

  try {
    const song = await apiPatch<Song>(url.toString(), { title, archived });

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

export async function fetchSongFilesAsZip(
  songId: string,
): Promise<DownloadedFile> {
  const url = new URL(`${API_BASE_URL}/songs/${songId}/download`);

  try {
    const file = await apiGet<DownloadedFile>(
      url.toString(),
      parseFileResponse,
    );

    return file;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch zip file for song ${songId}: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}

export type DownloadAllSongsRequest = {
  instrumentKeys?: string[];
  includeUnconnectedParts?: boolean;
};

export async function fetchAllSongFilesAsZip(
  request: DownloadAllSongsRequest,
): Promise<DownloadedFile> {
  const { instrumentKeys, includeUnconnectedParts } = request;

  const hasInstruments =
    instrumentKeys !== undefined && instrumentKeys.length > 0;
  if (!hasInstruments && includeUnconnectedParts !== true) {
    throw new Error("At least one download filter must be specified");
  }

  const url = new URL(`${API_BASE_URL}/download`);

  for (const instrumentKey of instrumentKeys ?? []) {
    url.searchParams.append("instrument", instrumentKey);
  }

  if (includeUnconnectedParts !== undefined) {
    url.searchParams.set(
      "include_unconnected_parts",
      String(includeUnconnectedParts),
    );
  }

  try {
    const file = await apiGet<DownloadedFile>(
      url.toString(),
      parseFileResponse,
    );

    return file;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch zip file: ${error.message}`,
        url.toString(),
        error.status,
      );
    }
    throw error;
  }
}
