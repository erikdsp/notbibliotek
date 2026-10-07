import type { ConcertResponse, Instrument, SongResponse } from "@/core/types";
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
import { ChevronDown, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";


type SheetMusicFilterProps = {
  concerts: ConcertResponse[];
  instruments: Instrument[];
  songs: SongResponse[];

  selectedConcert: string | null;
  onConcertChange: (value: string | null) => void;

  selectedInstrument: string | null;
  onInstrumentChange: (value: string | null) => void;

  selectedPart: string | null;
  onPartChange: (value: string | null) => void;

  includeScore: boolean;
  onIncludeScoreChange: (checked: boolean) => void;
}

export function SheetMusicFilters({
  concerts,
  instruments,
  songs,
  selectedConcert,
  onConcertChange,
  selectedInstrument,
  onInstrumentChange,
  selectedPart,
  onPartChange,
  includeScore,
  onIncludeScoreChange,
}: SheetMusicFilterProps) {

      const concertItems =
    concerts?.map((concert) => ({
      label: concert.name,
      value: concert.key,
    })) ?? [];

  const concertSelectItems = [
    { label: "All concerts", value: "all" },
    ...concertItems,
  ];

  const instrumentItems =
    instruments?.map((instrument) => ({
      label: instrument.name,
      value: instrument.key,
    })) ?? [];

  const instrumentSelectItems = [
    { label: "All instruments", value: "all" },
    ...instrumentItems,
  ];

  // Collect unique parts from the current version of each song.
  // Parts with the same key are considered the same; the first name found is used.
  const partsByKey = new Map<string, { label: string; value: string }>();

  songs?.forEach((song) => {
    const currentVersion = song.versions.find(
      (version) => version.song_version_id === song.current_version_id,
    );

    currentVersion?.parts.forEach((part) => {
      if (!partsByKey.has(part.key)) {
        partsByKey.set(part.key, {
          label: part.name,
          value: part.key,
        });
      }
    });
  });

  const partItems = Array.from(partsByKey.values());

  const partSelectItems = [{ label: "All parts", value: "all" }, ...partItems];

return (

          <Collapsible>
            <div className="flex flex-col mb-2 gap-4 md:flex-row md:gap-15">
              <div className="flex flex-1 flex-col gap-2">
                <div>Concert</div>
                <div>
                  <Select
                    items={concertSelectItems}
                    value={selectedConcert}
                    onValueChange={onConcertChange}
                  >
                    <SelectTrigger className="w-full min-w-72">
                      <SelectValue placeholder="Select a Concert" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All concerts</SelectItem>
                        <Separator className="my-1" />
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

              <div className="flex flex-1 flex-col gap-2">
                <div>Instrument</div>
                <div>
                  <Select
                    items={instrumentSelectItems}
                    value={selectedInstrument}
                    onValueChange={onInstrumentChange}
                  >
                    <SelectTrigger className="w-72">
                      <SelectValue placeholder="Select an instrument" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All instruments</SelectItem>
                        <Separator className="my-1" />
                        {instrumentItems.map((item) => (
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
                <div className="flex flex-1 flex-col gap-2">
                  <div>Part</div>
                  <div>
                    <Select
                      items={partSelectItems}
                      value={selectedPart}
                      onValueChange={onPartChange}
                    >
                      <SelectTrigger className="w-72">
                        <SelectValue placeholder="Select a part" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All parts</SelectItem>
                          <Separator className="my-1" />
                          {partItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <span>Part vs Instrument?</span>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Part vs Instrument"
                            />
                          }
                        >
                          <Info />
                        </TooltipTrigger>

                        <TooltipContent className="max-w-64">
                          Parts vary between songs. Use Part if you can't find
                          what you're looking for with the Instrument selection.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <div>Include Score</div>
                  <div className="flex h-9 items-center">
                    <Checkbox
                      checked={includeScore}
                      onCheckedChange={onIncludeScoreChange}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

)

}