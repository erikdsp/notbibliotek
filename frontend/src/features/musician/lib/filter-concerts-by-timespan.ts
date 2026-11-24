import type { ConcertDetailedResponse } from "@/core/types";

type FilterConcertsByTimespanParams = {
  concerts: ConcertDetailedResponse[];
  timespanMonths: string | null;
  selectedConcertKey: string | null;
};

export function filterConcertsByTimespan({
  concerts,
  timespanMonths,
  selectedConcertKey,
}: FilterConcertsByTimespanParams): ConcertDetailedResponse[] {
  const noFiltering = timespanMonths === null || timespanMonths === "all";
  if (noFiltering) return concerts;

  const months = Number(timespanMonths);
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  const cutoffDateString = cutoffDate.toLocaleDateString("sv-SE");

  return concerts.filter(
    (concert) =>
      concert.date >= cutoffDateString || concert.key === selectedConcertKey,
  );
}
