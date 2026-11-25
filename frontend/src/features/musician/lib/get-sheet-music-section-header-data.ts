import type { ConcertDetailedResponse, SongResponse } from "@/core/types";
import { getCurrentVersion } from "@/features/musician/lib/get-current-version";
import { formatDateTime } from "@/utils/format-time";

export type SheetMusicSectionHeaderData = {
  title: string;
  subTitle: string | null;
  showDownloadZipButton: boolean;
};

type GetSheetMusicSectionHeaderDataParams = {
  songSelected: boolean;
  partsSelected: boolean;
  selectedSong: SongResponse | undefined;
  selectedConcertDetails: ConcertDetailedResponse | undefined;
};

export function getSheetMusicSectionHeaderData({
  songSelected,
  partsSelected,
  selectedSong,
  selectedConcertDetails,
}: GetSheetMusicSectionHeaderDataParams): SheetMusicSectionHeaderData | null {
  const showDownloadZipButton = partsSelected || songSelected;

  if (songSelected) {
    if (selectedSong === undefined) {
      return null;
    }

    const currentVersion = getCurrentVersion(selectedSong);

    return {
      title: selectedSong.title,
      subTitle: currentVersion
        ? `Current version: ${formatDateTime(currentVersion.published_at)}`
        : "No published version",
      showDownloadZipButton,
    };
  }

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
