import type { SelectOption } from "@/types/select-option";
import { Plus, CopyPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type VersionControlsProps = {
  versionId: string | null;
  versionOptions: SelectOption[];
  onSelectVersion: (versionId: string | null) => void;
  onCreateEmptyDraft: () => void;
  isDirty: boolean;
  isCreatingVersion: boolean;
};

export function VersionControls({
  versionId,
  versionOptions,
  onSelectVersion,
  onCreateEmptyDraft,
  isDirty,
  isCreatingVersion,
}: VersionControlsProps) {
  const selectedVersionLabel = versionOptions.find(
    (option) => option.value === versionId,
  )?.label;

  return (
    <div className="space-y-2">
      <Label>Version</Label>

      <div className="flex items-center gap-3">
        <Select value={versionId} onValueChange={onSelectVersion}>
          <SelectTrigger className="w-2/3">
            <SelectValue placeholder="Select version">
              {selectedVersionLabel}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {versionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" disabled className="ml-auto">
          <CopyPlus />
          New Duplicate Draft
        </Button>

        <Tooltip>
          <TooltipTrigger render={<span />}>
            <Button
              variant="outline"
              disabled={isDirty || isCreatingVersion}
              onClick={onCreateEmptyDraft}
            >
              <Plus />
              New Empty Draft
            </Button>
          </TooltipTrigger>

          {isDirty && (
            <TooltipContent>
              Save or discard changes before creating a new draft.
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );
}
