import type { ConcertDetailedResponse, SongResponse } from "@/core/types";
import { getCurrentVersion } from "@/features/musician/lib/get-current-version";
import { formatDateTime } from "@/utils/format-time";

export type SheetMusicSectionHeaderData = {
  title: string;
  subTitle: string | null;
  showDownloadZipButton: boolean;
};

type GetSongHeaderDataParams = {
  selectedSong: SongResponse;
};

export function getSongHeaderData({
  selectedSong,
}: GetSongHeaderDataParams): SheetMusicSectionHeaderData {
  const currentVersion = getCurrentVersion(selectedSong);

  return {
    title: selectedSong.title,
    subTitle: currentVersion
      ? `Current version: ${formatDateTime(currentVersion.published_at)}`
      : "No published version",
    showDownloadZipButton: true,
  };
}

type GetSetlistHeaderDataParams = {
  partsSelected: boolean;
  selectedConcertDetails: ConcertDetailedResponse | undefined;
};

export function getSetlistHeaderData({
  partsSelected,
  selectedConcertDetails,
}: GetSetlistHeaderDataParams): SheetMusicSectionHeaderData {
  const showDownloadZipButton = partsSelected;

  if (selectedConcertDetails !== undefined) {
    return {
      title: selectedConcertDetails.name,
      subTitle: selectedConcertDetails.date,
      showDownloadZipButton,
    };
  }

  return {
    title: "All Songs in the Library",
    subTitle: null,
    showDownloadZipButton,
  };
}
