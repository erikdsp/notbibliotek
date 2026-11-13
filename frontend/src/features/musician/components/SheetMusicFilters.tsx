import type {
  ConcertDetailedResponse,
  Instrument,
  SongResponse,
} from "@/core/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupedSelect } from "@/components/grouped-select/GroupedSelect";
import { createInstrumentOptions } from "@/features/musician/lib/create-instrument-options";
import { createConcertOptions } from "@/features/musician/lib/create-concert-options";
import { createSongOptions } from "@/features/musician/lib/create-song-options";

type SheetMusicFilterProps = {
  concerts: ConcertDetailedResponse[];
  instruments: Instrument[];
  songs: SongResponse[];

  selectedConcert: string | null;
  onConcertChange: (value: string | null) => void;

  selectedInstrument: string | null;
  onInstrumentChange: (value: string | null) => void;

  selectedSongId: string | null;
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
  selectedSongId,
  onSongChange,
  includeScore,
  onIncludeScoreChange,
  moreOptionsOpen,
  onMoreOptionsOpenChange,
}: SheetMusicFilterProps) {
  const instrumentOptions = createInstrumentOptions(instruments);
  const concertOptions = createConcertOptions(concerts);
  const songOptions = createSongOptions(songs);

  return (
    <Collapsible open={moreOptionsOpen} onOpenChange={onMoreOptionsOpenChange}>
      <div className="flex flex-col mb-2 gap-4 md:flex-row md:gap-15">
        <div className="flex flex-1 flex-col gap-2">
          <div>Instrument</div>
          <div>
            <GroupedSelect
              options={instrumentOptions}
              value={selectedInstrument}
              onSelect={onInstrumentChange}
              placeholder="Select an instrument"
              className="w-66"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div>Set List / Concert</div>
          <div>
            <GroupedSelect
              options={concertOptions}
              value={selectedConcert}
              onSelect={onConcertChange}
              placeholder="Select a set list / concert"
              className="w-full min-w-80"
            />
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
              <GroupedSelect
                options={songOptions}
                value={selectedSongId}
                onSelect={onSongChange}
                placeholder="Select a song"
                className="w-80"
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
