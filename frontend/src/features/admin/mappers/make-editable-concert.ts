import type { ConcertDetailedResponse } from "@/core/types";
import type { EditableConcert } from "@/features/admin/types/concert-editor-types";

export function makeEditableConcert(
  concert: ConcertDetailedResponse | null,
): EditableConcert {
  if (concert === null) {
    return {
      id: null,
      key: "",
      name: "",
      date: "",
      song_ids: [],
    };
  }

  return {
    id: concert.id,
    key: concert.key,
    name: concert.name,
    date: concert.date,
    song_ids: concert.songs.map((s) => s.id),
  };
}
