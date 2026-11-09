import {
  createConcertSongConnection,
  deleteConcertSongConnection,
} from "@/services/concert-songs-service";

export async function saveSongConnections(
  concertId: string,
  originalSongIds: string[],
  editedSongIds: string[],
) {
  const originalIds = new Set(originalSongIds);
  const editedIds = new Set(editedSongIds);

  const addedIds = [...editedIds].filter((id) => !originalIds.has(id));
  const removedIds = [...originalIds].filter((id) => !editedIds.has(id));

  await Promise.all([
    ...addedIds.map((songId) => createConcertSongConnection(concertId, songId)),
    ...removedIds.map((songId) =>
      deleteConcertSongConnection(concertId, songId),
    ),
  ]);
}
