import { ApiError } from "@/errors/api-error";
import { createLogger } from "@/utils/logger";

const log = createLogger("apiRequest");

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
}

/**
 * Generic HTTP request helper for JSON APIs.
 *
 * Supports GET, POST, PUT, PATCH, and DELETE requests with optional
 * JSON request bodies and custom headers.
 *
 * @template T - Expected response type
 * @param url - The endpoint to send the request to
 * @param options - Request configuration including HTTP method, optional JSON body, and headers
 * @returns Parsed JSON response of type T, or an empty object for responses with no content (204)
 * @throws ApiError if the request fails, returns a non-success status code, or the response cannot be parsed
 */
export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined && {
          "Content-Type": "application/json",
        }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    log.debug(`${method} response`, response);

    if (!response.ok) {
      throw new ApiError(
        `API ${method} failed with status ${response.status}`,
        url,
        response.status,
      );
    }

    // No content
    if (response.status === 204) {
      return {} as T;
    }

    const rawJson = await response.json();
    return rawJson as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      `Unexpected ${method} error: ${(error as Error).message}`,
      url,
    );
  }
}
