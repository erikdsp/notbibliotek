import type { SelectOptionSection } from "@/types/select-option";
import { Plus, CopyPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GroupedSelect } from "@/components/grouped-select/GroupedSelect";

type VersionControlsProps = {
  versionId: string | null;
  versionOptions: SelectOptionSection[];
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
  return (
    <div className="space-y-2">
      <Label>Version</Label>

      <div className="flex items-center gap-3">
        <GroupedSelect
          options={versionOptions}
          value={versionId}
          onSelect={onSelectVersion}
          placeholder="Select version"
          className="w-2/3"
        />

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
