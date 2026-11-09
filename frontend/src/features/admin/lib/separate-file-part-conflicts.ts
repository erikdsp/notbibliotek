import type { EditablePart, FileConflict } from "@/features/admin/types";

export function separatePartFileConflicts(
  pdfFiles: File[],
  parts: EditablePart[],
) {
  const conflicts: FileConflict[] = [];
  const filesToAdd: File[] = [];

  for (const file of pdfFiles) {
    const existingPart = parts.find((part) => part.file_name === file.name);

    if (existingPart) {
      conflicts.push({
        file,
        existingPartLocalId: existingPart.local_id,
        existingPartName: existingPart.name,
      });
    } else {
      filesToAdd.push(file);
    }
  }
  return { conflicts, filesToAdd };
}
