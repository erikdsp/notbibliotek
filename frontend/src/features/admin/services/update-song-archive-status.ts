import { updateSong } from "@/services/songs-service";

type UpdateSongArchiveStatusParams = {
  songId: string;
  shouldBeArchived: boolean;
};

export async function updateSongArchiveStatus({
  songId,
  shouldBeArchived,
}: UpdateSongArchiveStatusParams) {
  return updateSong(songId, undefined, shouldBeArchived);
}
