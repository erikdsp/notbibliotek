import { Button } from "@/components/ui/button";
import type { SheetMusicSectionHeaderData } from "@/features/musician/lib/get-sheet-music-section-header-data";
import { Download } from "lucide-react";

type SheetMusicSectionHeaderProps = {
  headerData: SheetMusicSectionHeaderData;
  onDownloadAll: () => void;
  isDownloading: boolean;
};

export function SheetMusicSectionHeader({
  headerData,
  onDownloadAll,
  isDownloading,
}: SheetMusicSectionHeaderProps) {
  const { title, subTitle, showDownloadZipButton } = headerData;

  return (
    <div
      className={`flex flex-col py-2 md:py-0 my-0 md:my-3 md:flex-row w-full items-start justify-between`}
    >
      <div className={`flex w-fit`}>
        <div>
          <h2 className={`text-2xl font-bold`}>{title}</h2>
          {subTitle && <p className={`my-2`}>{subTitle}</p>}
        </div>
      </div>
      <div
        className={`py-6 md:py-0 empty:py-0 flex flex-col w-fit self-center md:self-auto items-center gap-4`}
      >
        {showDownloadZipButton && (
          <Button onClick={onDownloadAll} disabled={isDownloading}>
            <Download /> Download Sheet Music (.zip)
          </Button>
        )}
      </div>
    </div>
  );
}
