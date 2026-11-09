import type { EditablePart, FileConflict } from "@/features/admin/types";

export function replaceConflictingPartFiles(
  parts: EditablePart[],
  conflicts: FileConflict[],
): EditablePart[] {
  const updatedParts: EditablePart[] = [];

  for (const part of parts) {
    const conflict = conflicts.find(
      (conflict) => conflict.existingPartLocalId === part.local_id,
    );

    if (conflict) {
      updatedParts.push({
        ...part,
        file: conflict.file,
        file_name: conflict.file.name,
      });
    } else {
      updatedParts.push(part);
    }
  }

  return updatedParts;
}