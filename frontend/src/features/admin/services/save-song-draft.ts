import type { EditablePart, EditableScore } from "@/features/admin/types";
import {
  deleteScore,
  updateScore,
  uploadScore,
} from "@/services/song-version-service";
import { updateSong } from "@/services/songs-service";
import { createLogger } from "@/utils/logger";

const log = createLogger("saveSongDraft");

type saveSongDraftParams = {
  songId: string;
  versionId: string | null;
  title: string;
  titleIsDirty: boolean;
  scoreIsDirty: boolean;
  partsAreDirty: boolean;
  score: EditableScore | null;
  originalScore: EditableScore | null;
  parts: EditablePart[] | null;
  originalParts: EditablePart[] | null;
};

export async function saveSongDraft({
  songId,
  versionId,
  title,
  titleIsDirty,
  scoreIsDirty,
  partsAreDirty,
  score,
  originalScore,
  parts,
  originalParts,
}: saveSongDraftParams) {
  if (titleIsDirty) {
    log.debug("Updating title", title);
    await updateSong(songId, title);
  }

  if (versionId === null) {
    return;
  }

  if (scoreIsDirty) {
    if (originalScore === null && score?.file != null) {
      log.debug("Posting score", score);
      await uploadScore(songId, versionId, score.file);
    } else if (originalScore !== null && score === null) {
      log.debug("Deleting score");
      await deleteScore(songId, versionId);
    } else if (originalScore !== null && score?.file != null) {
      log.debug("Updating score", score);
      await updateScore(songId, versionId, score.file);
    }
  }

  if (partsAreDirty) {
    if (parts === null || originalParts === null) return;

    const originalPartsById = new Map(
      originalParts.map((part) => [part.id, part]),
    );

    for (const part of parts) {
      if (part.id === null && part.file !== null) {

        // const createdPart = await uploadPart(songId, versionId, part.key, part.name, part.file,);

        for (const instrumentId of part.instrument_ids) {
          log.debug("Create connections for instrumentId: ", instrumentId)
          // await createPartInstrumentConnection(createdPart.id, instrumentId);
        }
        continue;
      }

      const original = originalPartsById.get(part.id);
      if (!original) continue;

      if (
        part.name !== original.name ||
        part.file != null
      ) {
        if (part.file === null) {
          throw new Error(
            `Cannot update part "${part.name}" without a PDF file`,
          );
        }
        // await updatePart(songId, versionId, part.key, part.name, part.file);
      }

      if (part.id === null) continue;

      for (const id of part.instrument_ids) {
        if (!original.instrument_ids.includes(id)) {
          // await createPartInstrumentConnection(part.id, id);
        }
      }

      for (const id of original.instrument_ids) {
        if (!part.instrument_ids.includes(id)) {
          // await deletePartInstrumentConnection(part.id, id);
        }
      }
    }

    const editedPartIds = new Set(parts.map((part) => part.id));

    for (const original of originalParts) {
      if (!editedPartIds.has(original.id)) {
        // await deletePart(songId, versionId, original.key);
      }
    }
  }
}
