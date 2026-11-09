import type { EditablePart } from "@/features/admin/types";

export function partsHaveChanged(
  parts: EditablePart[] | null,
  originalParts: EditablePart[] | null,
): boolean {
  if (parts === null || originalParts === null) return false;

  return (
    parts.length !== originalParts.length ||
    parts.some((part) => partHasChanged(part, originalParts))
  );
}

function partHasChanged(
  part: EditablePart,
  originalParts: EditablePart[],
): boolean {
  if (part.id === null) return true;

  const original = originalParts.find((p) => p.id === part.id);

  if (!original) {
    return true;
  }

  return (
    part.name !== original.name ||
    part.file_id !== original.file_id ||
    part.file != null ||
    part.instrument_ids.length !== original.instrument_ids.length ||
    part.instrument_ids.some((id) => !original.instrument_ids.includes(id))
  );
}
