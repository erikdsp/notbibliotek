import type { EditablePart } from "@/features/admin/types";

export type PartErrors = {
  name?: string;
  key?: string;
};

export type SongDraftErrors = {
  title?: string;
  parts: Record<string, PartErrors>;
};

export function validateSongDraft(
  title: string,
  parts: EditablePart[] | null,
): SongDraftErrors {
  const errors: SongDraftErrors = { parts: {} };

  if (!title.trim()) {
    errors.title = "Song title is required";
  }

  if (parts === null) return errors;

  const keyCounts = new Map<string, number>();

  for (const part of parts) {
    const partKeyCount = keyCounts.get(part.key) ?? 0;
    keyCounts.set(part.key, partKeyCount + 1);
  }

  for (const part of parts) {
    const partErrors: PartErrors = {};
    const partKeyCount = keyCounts.get(part.key) ?? 0;

    if (!part.name.trim()) {
      partErrors.name = "Part name is required";
    }

    if (!part.key.trim()) {
      partErrors.key = "Part key is required";
    } else if (partKeyCount > 1) {
      partErrors.key = "Part key must be unique";
    }

    if (partErrors.name || partErrors.key) {
      errors.parts[part.local_id] = partErrors;
    }
  }

  return errors;
}
