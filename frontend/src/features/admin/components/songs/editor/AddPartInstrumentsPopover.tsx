import type { Instrument } from "@/core/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

type AddPartInstrumentsPopoverProps = {
  instrumentIds: string[];
  instruments: Instrument[];
  onAddInstrumentConnection: (instrumentId: string) => void;
  onRemoveInstrumentConnection: (instrumentId: string) => void;
};

export function AddPartInstrumentsPopover({
  instrumentIds,
  instruments,
  onAddInstrumentConnection,
  onRemoveInstrumentConnection,
}: AddPartInstrumentsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="sm" className="h-7" />}
      >
        <Plus className="size-3" />
        Add instrument
      </PopoverTrigger>

      <PopoverContent align="start" className="w-56 space-y-2">
        {instruments.map((instrument) => (
          <Label
            key={instrument.id}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <Checkbox
              checked={instrumentIds.includes(instrument.id)}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  onAddInstrumentConnection(instrument.id);
                } else {
                  onRemoveInstrumentConnection(instrument.id);
                }
              }}
            />
            {instrument.name}
          </Label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
