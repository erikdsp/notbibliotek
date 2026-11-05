import type { EditablePart } from "@/features/admin/types";

export type PartErrors = {
  name?: string;
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

  for (const part of parts) {
    if (!part.name.trim()) {
      errors.parts[part.local_id] = {
        name: "Part name is required",
      };
    }
  }

  return errors;
}