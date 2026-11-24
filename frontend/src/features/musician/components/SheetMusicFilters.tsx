import type {
  ConcertDetailedResponse,
  Instrument,
  SongResponse,
} from "@/core/types";
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
import { concertTimespanOptions } from "@/features/musician/constants/concert-timespan-options";

type SheetMusicFilterProps = {
  concerts: ConcertDetailedResponse[];
  instruments: Instrument[];
  songs: SongResponse[];

  selectedConcertKey: string | null;
  onConcertChange: (value: string | null) => void;

  selectedInstrument: string | null;
  onInstrumentChange: (value: string | null) => void;

  selectedSongId: string | null;
  onSongChange: (value: string | null) => void;

  selectedTimespan: string | null;
  onTimespanChange: (value: string | null) => void;

  moreOptionsOpen: boolean;
  onMoreOptionsOpenChange: (open: boolean) => void;
};

export function SheetMusicFilters({
  concerts,
  instruments,
  songs,
  selectedConcertKey,
  onConcertChange,
  selectedInstrument,
  onInstrumentChange,
  selectedSongId,
  onSongChange,
  selectedTimespan,
  onTimespanChange,
  moreOptionsOpen,
  onMoreOptionsOpenChange,
}: SheetMusicFilterProps) {
  const instrumentOptions = createInstrumentOptions(instruments);
  const concertOptions = createConcertOptions(concerts);
  const songOptions = createSongOptions(songs);

  const columns = "md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_7rem]";

  return (
    <Collapsible open={moreOptionsOpen} onOpenChange={onMoreOptionsOpenChange} className="w-full px-2 lg:px-6" >
      <div className={`grid grid-cols-1 mb-2 gap-4 lg:gap-x-10 ${columns}`}>
        <div className="flex flex-col gap-2">
          <div>Instrument</div>
          <div>
            <GroupedSelect
              options={instrumentOptions}
              value={selectedInstrument}
              onSelect={onInstrumentChange}
              placeholder="Select an instrument"
              className="w-full min-w-0 md:min-w-60"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div>Set List / Concert</div>
          <div>
            <GroupedSelect
              options={concertOptions}
              value={selectedConcertKey}
              onSelect={onConcertChange}
              placeholder="Select a set list / concert"
              className="w-full min-w-0 md:min-w-80"
            />
          </div>
        </div>

        <div className="flex flex-row items-center gap-6 justify-self-end md:col-span-2 lg:col-span-1 lg:flex-col lg:gap-2">
          <div className="">More options</div>
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
        <div className={`grid grid-cols-1 gap-4 mt-4 md:gap-x-10 ${columns}`}>
          <div className="flex flex-col gap-2">
            <div>
              Song <span className="text-sm">(score and all parts)</span>
            </div>
            <div>
              <GroupedSelect
                options={songOptions}
                value={selectedSongId}
                onSelect={onSongChange}
                placeholder="Select a song"
                className="w-full min-w-0 md:min-w-60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div>Timespan <span className="text-sm">(Past Concerts)</span> </div>
            <div>
              <GroupedSelect
                options={concertTimespanOptions}
                value={selectedTimespan}
                onSelect={onTimespanChange}
                placeholder="Select a timespan"
                className="w-full min-w-0 md:min-w-80"
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
