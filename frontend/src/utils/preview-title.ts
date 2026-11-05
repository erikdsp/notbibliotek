import type { VersionPart, VersionScore } from "@/core/types";

export function previewTitleFromPart(part: VersionPart): string {
  return `Preview of ${part.file.name} - ${part.name}`;
}

export function previewTitleFromScore(score: VersionScore): string {
  return `Preview of ${score.file.name} - Full Score`;
}