import type { ConcertDetailedResponse } from "@/core/types";
import { resetValue, type SelectOptionSection } from "@/types/select-option";
import { formatDate } from "@/utils";

export function createConcertOptions(
  concerts: ConcertDetailedResponse[],
): SelectOptionSection[] {

  const result: SelectOptionSection[] = [
    {
      options: [
        { label: "Reset setlist / concert selection", value: resetValue },
      ],
      hideWhenNoSelection: true,
    },
    { options: [] },
  ];

  for (const concert of concerts) {
    result[1].options.push({
      label: `${concert.name} - ${formatDate(concert.date)}`,
      value: concert.key,
    });
  }

  return result;
}
