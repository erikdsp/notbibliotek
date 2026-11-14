import { apiRequest, type ResponseParser } from "./api-request";

/**
 * Send a GET request and return the JSON response.
 * @template T - Expected response type
 */
export const apiGet = <T>(url: string, parseResponse?: ResponseParser<T>) =>
  apiRequest<T>(url, { parseResponse });

/**
 * Send a POST request with an optional JSON payload.
 * @template T - Expected response type
 */
export const apiPost = <T>(
  url: string,
  body?: unknown,
  parseResponse?: ResponseParser<T>,
) =>
  apiRequest<T>(url, {
    method: "POST",
    body,
    parseResponse,
  });

/**
 * Send a PUT request with an optional JSON payload.
 * @template T - Expected response type
 */
export const apiPut = <T>(url: string, body?: unknown, parseResponse?: ResponseParser<T>,) =>
  apiRequest<T>(url, {
    method: "PUT",
    body,
    parseResponse,
  });

/**
 * Send a PATCH request with an optional JSON payload.
 * @template T - Expected response type
 */
export const apiPatch = <T>(url: string, body?: unknown, parseResponse?: ResponseParser<T>,) =>
  apiRequest<T>(url, {
    method: "PATCH",
    body,
    parseResponse,
  });

/**
 * Send a DELETE request.
 * @template T - Expected response type
 */
export const apiDelete = <T>(url: string, parseResponse?: ResponseParser<T>,) =>
  apiRequest<T>(url, {
    method: "DELETE",
    parseResponse,
  });
