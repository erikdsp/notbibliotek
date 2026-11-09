import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Instrument } from "@/core/types";
import { X } from "lucide-react";

type SelectedPartInstrumentsProps = {
  instrumentIds: string[];
  instruments: Instrument[];
  onRemoveInstrumentConnection: (instrumentId: string) => void;
};

export function SelectedPartInstruments({
  instrumentIds,
  instruments,
  onRemoveInstrumentConnection,
}: SelectedPartInstrumentsProps) {
  return instrumentIds.map((id) => {
    const instrument = instruments.find((instrument) => instrument.id === id);

    if (!instrument) return null;

    return (
      <Badge key={id} variant="secondary" className="gap-1">
        {instrument.name}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-auto p-0"
          aria-label={`Remove ${instrument.name}`}
          onClick={() => onRemoveInstrumentConnection(id)}
        >
          <X className="size-3" />
        </Button>
      </Badge>
    );
  });
}
