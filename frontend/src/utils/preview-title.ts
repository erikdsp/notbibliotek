export function previewTitleFromPartNames(fileName: string, partName: string): string {
  return `Preview of ${fileName} - ${partName}`;
}

export function previewTitleFromScoreName(fileName: string): string {
  return `Preview of ${fileName} - Full Score`;
}