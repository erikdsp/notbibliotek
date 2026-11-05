import type {
  ConcertDetailedResponse,
  Instrument,
  SongResponse,
} from "@/core/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/format-time";
import { createLogger } from "@/utils/logger";
import {
  allItemsValue,
  oddPartsValue,
} from "@/features/musician/constants/select-options";

const log = createLogger("SheetMusicFilters");

type SheetMusicFilterProps = {
  concerts: ConcertDetailedResponse[];
  instruments: Instrument[];
  songs: SongResponse[];

  selectedConcert: string | null;
  onConcertChange: (value: string | null) => void;

  selectedInstrument: string | null;
  onInstrumentChange: (value: string | null) => void;

  selectedSong: string | null;
  onSongChange: (value: string | null) => void;

  includeScore: boolean;
  onIncludeScoreChange: (checked: boolean) => void;

  moreOptionsOpen: boolean;
  onMoreOptionsOpenChange: (open: boolean) => void;
};

export function SheetMusicFilters({
  concerts,
  instruments,
  songs,
  selectedConcert,
  onConcertChange,
  selectedInstrument,
  onInstrumentChange,
  selectedSong,
  onSongChange,
  includeScore,
  onIncludeScoreChange,
  moreOptionsOpen,
  onMoreOptionsOpenChange,
}: SheetMusicFilterProps) {
  const concertItems =
    concerts?.map((concert) => ({
      label: concert.name + " - " + formatDate(concert.date),
      value: concert.key,
    })) ?? [];

  const resetConcertItem = { label: "Reset setlist / concert selection", value: allItemsValue };
  const concertSelectItems = [resetConcertItem, ...concertItems];

  const instrumentItems =
    instruments?.map((instrument) => ({
      label: instrument.name,
      value: instrument.key,
    })) ?? [];

  const resetInstrumentItem = {
    label: "Reset instrument selection",
    value: allItemsValue,
  };
  const oddPartsItem = { label: "Odd Parts", value: oddPartsValue };

  const instrumentSelectItems = [
    resetInstrumentItem,
    ...instrumentItems,
    oddPartsItem,
  ];

  const songItems = songs.map((song) => ({
    label: song.title,
    value: song.id,
  }));

  const resetSongItem = { label: "Reset song selection", value: allItemsValue };
  const songSelectItems = [resetSongItem, ...songItems];

  log.debug("Songs: ", songs);

  return (
    <Collapsible open={moreOptionsOpen} onOpenChange={onMoreOptionsOpenChange}>
      <div className="flex flex-col mb-2 gap-4 md:flex-row md:gap-15">
        <div className="flex flex-1 flex-col gap-2">
          <div>Instrument</div>
          <div>
            <Select
              items={instrumentSelectItems}
              value={selectedInstrument}
              onValueChange={onInstrumentChange}
            >
              <SelectTrigger className="w-66">
                <SelectValue placeholder="Select an instrument" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {selectedInstrument && (
                    <>
                      <SelectItem value={resetInstrumentItem.value}>
                        {resetInstrumentItem.label}
                      </SelectItem>
                      <Separator className="my-1" />
                    </>
                  )}
                  {instrumentItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                  <Separator className="my-1" />
                  <SelectItem value={oddPartsItem.value}>
                    {oddPartsItem.label}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div>Set List / Concert</div>
          <div>
            <Select
              items={concertSelectItems}
              value={selectedConcert}
              onValueChange={onConcertChange}
            >
              <SelectTrigger className="w-full min-w-80">
                <SelectValue placeholder="Select a set list / concert" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {selectedConcert && (
                    <>
                      <SelectItem value={resetConcertItem.value}>
                        {resetConcertItem.label}
                      </SelectItem>
                      <Separator className="my-1" />
                    </>
                  )}
                  {concertItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <div>More options</div>
          <div className="flex h-9 items-center">
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="More options"
                  className="w-full hover:bg-transparent aria-expanded:bg-transparent"
                />
              }
            >
              <ChevronDown className="group-data-panel-open/button:rotate-180" />
            </CollapsibleTrigger>
          </div>
        </div>
      </div>

      <CollapsibleContent>
        <div className="flex flex-col gap-4 mt-4 md:flex-row md:gap-15">
          <div className="flex shrink-0 flex-col gap-2">
            <div className="flex items-center text-sm text-muted-foreground gap-1 mt-2 w-66">
              <div>Include score</div>
              <div className="flex h-9 pl-3 items-center">
                <Checkbox
                  checked={includeScore}
                  onCheckedChange={onIncludeScoreChange}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <div>
              Song <span className="text-sm">(score and all parts)</span>
            </div>
            <div>
              <Select
                items={songSelectItems}
                value={selectedSong}
                onValueChange={onSongChange}
              >
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Select a song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {selectedSong && (
                      <>
                        <SelectItem value={resetSongItem.value}>
                          {resetSongItem.label}
                        </SelectItem>
                        <Separator className="my-1" />
                      </>
                    )}
                    {songItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
