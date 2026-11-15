import type { ConcertDetailedResponse } from "@/core/types";
import type { DownloadConcertRequest } from "@/services/concerts-service";

export function getDownloadConcertRequest(
    selectedConcertDetails: ConcertDetailedResponse, 
    instrumentKeys: string[] | undefined, 
    includeUnconnectedParts: boolean,
): DownloadConcertRequest {

    const result : DownloadConcertRequest = {
      concertId: selectedConcertDetails.id,
      instrumentKeys,
      includeUnconnectedParts: includeUnconnectedParts ?? undefined
    };

    return result;
}