/**
 * Custom error type for API requests
 */
export class ApiError extends Error {
  public readonly status?: number;
  public readonly url: string;

  constructor(message: string, url: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.url = url;
    this.status = status;
  }
}
