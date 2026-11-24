import type { ConcertDetailedResponse } from "@/core/types";
import { resetValue, type SelectOptionSection } from "@/types/select-option";
import { formatDate } from "@/utils";

export function createConcertOptions(
  concerts: ConcertDetailedResponse[],
): SelectOptionSection[] {
  const today = new Date().toLocaleDateString("sv-SE");
  const upcomingConcerts = concerts.filter((concert) => concert.date >= today);
  const pastConcerts = concerts.filter((concert) => concert.date < today);

  const result: SelectOptionSection[] = [
    {
      options: [
        { label: "Reset setlist / concert selection", value: resetValue },
      ],
      hideWhenNoSelection: true,
    },
    { sectionLabel: "Upcoming concerts", options: [] },
  ];

  for (const concert of upcomingConcerts) {
    result[1].options.push({
      label: `${concert.name} - ${formatDate(concert.date)}`,
      value: concert.key,
    });
  }

  if (pastConcerts.length > 0) {
    result.push({ sectionLabel: "Past concerts", options: [] });
    for (const concert of pastConcerts) {
      result[2].options.push({
        label: `${concert.name} - ${formatDate(concert.date)}`,
        value: concert.key,
      });
    }
  }

  return result;
}
