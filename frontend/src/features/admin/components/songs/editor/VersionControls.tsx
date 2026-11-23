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
  onCreateDuplicateDraft: () => void;
  isDirty: boolean;
  isCreatingVersion: boolean;
  isArchived: boolean;
};

export function VersionControls({
  versionId,
  versionOptions,
  onSelectVersion,
  onCreateEmptyDraft,
  onCreateDuplicateDraft,
  isDirty,
  isCreatingVersion,
  isArchived,
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

        <Tooltip disabled={!isDirty || versionId === null || isArchived}>
          <TooltipTrigger render={<span />}>
            <Button
              variant="outline"
              disabled={isDirty || isCreatingVersion || versionId === null || isArchived}
              onClick={onCreateDuplicateDraft}
              className="ml-auto"
            >
              <CopyPlus />
              New Duplicate Draft
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            Save or discard changes before duplicating draft.
          </TooltipContent>
        </Tooltip>

        <Tooltip disabled={!isDirty || isArchived}>
          <TooltipTrigger render={<span />}>
            <Button
              variant="outline"
              disabled={isDirty || isCreatingVersion || isArchived}
              onClick={onCreateEmptyDraft}
            >
              <Plus />
              New Empty Draft
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            Save or discard changes before creating a new draft.
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
