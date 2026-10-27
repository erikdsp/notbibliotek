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
 * Generic HTTP request helper.
 *
 * Supports GET, POST, PUT, PATCH, and DELETE requests with optional
 * JSON and multipart/form-data request bodies.
 * Parses JSON responses and returns undefined for empty responses.
 *
 * @template T - Expected response type
 * @param url - The endpoint to send the request to
 * @param options - Request configuration including HTTP method, optional body, and headers
 * @returns Parsed JSON response of type T, or undefined for responses with no content
 * @throws ApiError if the request fails
 */
export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const isFormData = body instanceof FormData;

  const requestHeaders = new Headers(headers);

  if (body !== undefined && !isFormData && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    });

    log.debug(`${method} response`, response);

    if (!response.ok) {
      throw new ApiError(
        `API ${method} failed with status ${response.status}`,
        url,
        response.status,
      );
    }

    const rawText = await response.text();

    if (rawText.length === 0) {
      return undefined as T;
    }

    return JSON.parse(rawText) as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      `Unexpected ${method} error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      url,
    );
  }
}