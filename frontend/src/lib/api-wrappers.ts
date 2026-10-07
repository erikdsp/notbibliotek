import { apiRequest } from "./api-request";

/**
 * Send a GET request and return the JSON response.
 * @template T - Expected response type
 */
export const apiGet = <T>(url: string) => apiRequest<T>(url);

/**
 * Send a POST request with an optional JSON payload.
 * @template T - Expected response type
 */
export const apiPost = <T>(url: string, body?: unknown) =>
  apiRequest<T>(url, {
    method: "POST",
    body,
  });

/**
 * Send a PUT request with an optional JSON payload.
 * @template T - Expected response type
 */
export const apiPut = <T>(url: string, body?: unknown) =>
  apiRequest<T>(url, {
    method: "PUT",
    body,
  });

/**
 * Send a PATCH request with an optional JSON payload.
 * @template T - Expected response type
 */
export const apiPatch = <T>(url: string, body?: unknown) =>
  apiRequest<T>(url, {
    method: "PATCH",
    body,
  });

/**
 * Send a DELETE request.
 * @template T - Expected response type
 */
export const apiDelete = <T>(url: string) =>
  apiRequest<T>(url, {
    method: "DELETE",
  });
