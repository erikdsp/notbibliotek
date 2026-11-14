export type DownloadedFile = {
  blob: Blob;
  fileName: string;
};

export async function parseFileResponse(
  response: Response,
): Promise<DownloadedFile> {
  const disposition = response.headers.get("Content-Disposition");

  if (!disposition) {
    throw new Error("Missing Content-Disposition header");
  }

  const encodedFileName = disposition
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("filename*=UTF-8''"))
    ?.slice("filename*=UTF-8''".length);

  if (!encodedFileName) {
    throw new Error("Missing filename in Content-Disposition");
  }

  return {
    blob: await response.blob(),
    fileName: decodeURIComponent(encodedFileName),
  };
}