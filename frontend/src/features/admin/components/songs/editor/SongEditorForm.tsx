import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createLogger } from "@/utils";
import type { SongResponse, Instrument } from "@/core/types";
import type {
  EditablePart,
  ScoreEdits,
  PartsEdits,
  PendingPartUpload,
  FileConflict,
} from "@/features/admin/types";
import { makeEditableScore, makeEditableParts } from "@/features/admin/mappers";
import {
  useCreateSong,
  useCreateSongVersion,
  usePartInstruments,
  usePdfPreview,
  usePublishSongVersion,
} from "@/hooks";
import { saveSongDraft } from "@/features/admin/services";
import {
  SongTitleInput,
  VersionControls,
  ScoreSection,
  PartsSection,
  AddSongFooter,
  EditSongFooter,
} from "@/features/admin/components/songs/editor";
import {
  PartUploadDuplicatesDialog,
  UnsavedChangesOnVersionSwitchDialog,
  UnsavedChangesOnCloseDialog,
  SaveDraftErrorDialog,
  ConfirmPublishDialog,
} from "@/features/admin/components/songs/editor/dialogs";
import {
  initialVersionId,
  partsHaveChanged,
  refetchSongQueries,
  validateSongDraft,
  separatePartFileConflicts,
  createEditablePart,
  replaceConflictingPartFiles,
  createVersionOptions,
} from "@/features/admin/lib";
import { PdfPreviewDialog } from "@/components/pdf-preview";
import type { Preview } from "@/types";

const log = createLogger("SongEditorForm");

type SongEditorFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: SongResponse | null;
  instruments: Instrument[];
  onSongCreated: (songId: string) => void;
  isAddingSong: boolean;
};

export function SongEditorForm({
  open,
  onOpenChange,
  song,
  instruments,
  onSongCreated,
  isAddingSong,
}: SongEditorFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(song?.title ?? "");
  const [createdSongId, setCreatedSongId] = useState<string | null>(null);
  const [versionId, setVersionId] = useState<string | null>(() =>
    initialVersionId(song),
  );
  const {
    data: partInstruments,
    isPending: instrumentsPending,
    isError: instrumentsError,
  } = usePartInstruments(song?.id ?? null, versionId);

  const [editedScore, setEditedScore] = useState<ScoreEdits | null>(null);
  const [editedParts, setEditedParts] = useState<PartsEdits | null>(null);
  const [pendingPartUpload, setPendingPartUpload] =
    useState<PendingPartUpload | null>(null);
  const [pendingVersionId, setPendingVersionId] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [saveErrorOpen, setSaveErrorOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);

  const previewFileId = preview?.type === "saved" ? preview.fileId : null;
  const {
    data: savedPreviewFile,
    isFetching: previewIsLoading,
    error: previewError,
  } = usePdfPreview(previewFileId);
  const previewFile =
    preview?.type === "local" ? preview.file : (savedPreviewFile ?? null);

  const originalScore = makeEditableScore(song, versionId);

  const score =
    editedScore?.versionId === versionId ? editedScore.score : originalScore;

  const originalParts =
    partInstruments !== undefined
      ? makeEditableParts(song, versionId, partInstruments)
      : null;

  const parts =
    editedParts?.versionId === versionId ? editedParts.parts : originalParts;

  const titleIsDirty = title !== (song?.title ?? "");
  const scoreIsDirty =
    score?.file_id !== originalScore?.file_id || score?.file != null;
  const partsAreDirty = partsHaveChanged(parts, originalParts);
  const versionIsDirty = scoreIsDirty || partsAreDirty;
  const isDirty = titleIsDirty || versionIsDirty;

  const validationErrors = validateSongDraft(title, parts);
  const isValid =
    validationErrors.title === undefined &&
    Object.keys(validationErrors.parts).length === 0;

  const hasScore = score !== null;
  const selectedVersion = song?.versions.find(
    (version) => version.song_version_id === versionId,
  );
  const isPublished = selectedVersion?.published_at != null;
  const versionOptions = createVersionOptions(song);

  function requestClose() {
    if (song !== null && isDirty) {
      setConfirmClose(true);
    } else {
      onOpenChange(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      requestClose();
    }
  }

  const createSongMutation = useCreateSong();
  const createSongVersionMutation = useCreateSongVersion();

  async function handleCreateSong() {
    try {
      let songId = createdSongId;

      if (songId === null) {
        const newSong = await createSongMutation.mutateAsync(title.trim());
        songId = newSong.id;
        setCreatedSongId(songId);
      }

      await createSongVersionMutation.mutateAsync(songId);

      onSongCreated(songId);
    } catch (error) {
      log.error("Failed to create song:", error);
    }
  }

  async function handleCreateEmptyDraft() {
    if (song === null) return;

    try {
      const createdVersion = await createSongVersionMutation.mutateAsync(
        song.id,
      );
      switchVersion(createdVersion.id);
    } catch (error) {
      log.error("Failed to create song version:", error);
    }
  }

  function switchVersion(nextVersionId: string | null) {
    setVersionId(nextVersionId);
    setEditedScore(null);
    setEditedParts(null);
  }

  function handleSelectVersion(nextVersionId: string | null) {
    if (nextVersionId === versionId) return;

    if (versionIsDirty) {
      setPendingVersionId(nextVersionId);
      return;
    }

    switchVersion(nextVersionId);
  }

  function addScoreFile(file: File) {
    if (file.type !== "application/pdf") return;

    if (versionId === null) return;

    setEditedScore({
      versionId,
      score: {
        file_id: null,
        file_name: file.name,
        file,
      },
    });
  }

  function addPartFiles(files: FileList | File[]) {
    if (versionId === null || originalParts === null || parts === null) return;

    const pdfFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf",
    );

    const { conflicts, filesToAdd } = separatePartFileConflicts(
      pdfFiles,
      parts,
    );

    const newParts = filesToAdd.map((file) =>
      createEditablePart(file, instruments),
    );

    if (newParts.length > 0) {
      setEditedParts({
        versionId,
        parts: [...parts, ...newParts],
      });
    }

    if (conflicts.length > 0) {
      setPendingPartUpload({
        versionId,
        conflicts,
      });
    }
  }

  function resolveSinglePartConflict(
    index: number,
    action: "skip" | "replace",
  ) {
    if (pendingPartUpload === null) return;

    const conflict = pendingPartUpload.conflicts[index];
    resolvePartConflicts(action, [conflict]);
  }

  function resolveAllPartConflicts(action: "skip" | "replace") {
    if (pendingPartUpload === null) return;

    resolvePartConflicts(action, pendingPartUpload.conflicts);
  }

  function resolvePartConflicts(
    action: "skip" | "replace",
    conflictsToResolve: FileConflict[],
  ) {
    if (pendingPartUpload === null || versionId === null || parts === null)
      return;
    if (pendingPartUpload.versionId !== versionId) return;

    if (action === "replace" && conflictsToResolve.length > 0) {
      const updatedParts = replaceConflictingPartFiles(
        parts,
        conflictsToResolve,
      );

      setEditedParts({
        versionId,
        parts: updatedParts,
      });
    }

    const remainingConflicts = pendingPartUpload.conflicts.filter(
      (conflict) => !conflictsToResolve.includes(conflict),
    );

    setPendingPartUpload(
      remainingConflicts.length > 0
        ? { versionId, conflicts: remainingConflicts }
        : null,
    );
  }

  function updateEditablePart(localId: string, update: Partial<EditablePart>) {
    if (versionId === null || originalParts === null) return;

    setEditedParts((current) => {
      const parts =
        current?.versionId === versionId ? current.parts : originalParts;

      const updatedParts = parts.map((part) =>
        part.local_id === localId ? { ...part, ...update } : part,
      );

      return {
        versionId,
        parts: updatedParts,
      };
    });
  }

  function replacePartFile(localId: string, file: File) {
    if (file.type !== "application/pdf") return;

    updateEditablePart(localId, {
      file,
      file_name: file.name,
    });
  }

  function addInstrumentConnection(part: EditablePart, instrumentId: string) {
    if (part.instrument_ids.includes(instrumentId)) {
      log.warn("Adding already existing Instrument connection: ", instrumentId);
      return;
    }

    updateEditablePart(part.local_id, {
      instrument_ids: [...part.instrument_ids, instrumentId],
    });
  }

  function removeInstrumentConnection(
    part: EditablePart,
    instrumentId: string,
  ) {
    updateEditablePart(part.local_id, {
      instrument_ids: part.instrument_ids.filter((id) => id !== instrumentId),
    });
  }

  function handlePreviewFile(
    file: File | null,
    fileId: string | null,
    title: string,
  ) {
    if (file === null && fileId === null) return;

    if (file !== null) {
      setPreview({ type: "local", file, title });
      return;
    }

    if (fileId !== null) {
      setPreview({ type: "saved", fileId, title });
    }
  }

  function handleRemoveScore() {
    if (versionId === null) return;

    setEditedScore({
      versionId,
      score: null,
    });
  }

  function handleRemovePart(localId: string) {
    if (versionId === null || originalParts === null) return;

    setEditedParts((current) => ({
      versionId,
      parts: (current?.versionId === versionId
        ? current.parts
        : originalParts
      ).filter((part) => part.local_id !== localId),
    }));
  }

  async function handleSaveDraftSuccess() {
    if (song === null) return;
    await refetchSongQueries(queryClient, song.id, versionId);
    setEditedScore(null);
    setEditedParts(null);
  }

  async function handleSaveDraftError(error: Error) {
    log.error("Failed to save draft", error);
    setSaveErrorOpen(true);
    if (song === null) return;
    await refetchSongQueries(queryClient, song.id, versionId);
  }

  const saveDraftMutation = useMutation({
    mutationFn: saveSongDraft,
    onSuccess: handleSaveDraftSuccess,
    onError: handleSaveDraftError,
  });

  function handleSaveDraft() {
    if (song === null) {
      return Promise.resolve();
    }

    return saveDraftMutation.mutateAsync({
      songId: song.id,
      versionId,
      title,
      titleIsDirty,
      scoreIsDirty,
      partsAreDirty,
      score,
      originalScore,
      parts,
      originalParts,
    });
  }

  const publishSongVersionMutation = usePublishSongVersion();

  async function handlePublishVersion() {
    if (
      song === null ||
      versionId === null ||
      isPublished ||
      !isValid ||
      !hasScore
    ) {
      return;
    }

    try {
      if (isDirty) {
        await handleSaveDraft();
      }

      await publishSongVersionMutation.mutateAsync({
        songId: song.id,
        versionId,
      });
      await refetchSongQueries(queryClient, song.id, versionId);

      setConfirmPublish(false);
      onOpenChange(false);
    } catch (error) {
      log.error("Failed to publish song version", error);
    }
  }

  function handleConfirmPublishOpenChange(open: boolean) {
    setConfirmPublish(open);
    if (!open) {
      publishSongVersionMutation.reset();
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={`flex max-h-[90vh] flex-col overflow-hidden ${
            song === null ? "sm:max-w-2xl" : "sm:max-w-4xl"
          }`}
        >
          <div className="-mr-5 min-h-0 flex-1 overflow-y-auto pl-1 pr-6">
            <DialogHeader className="pb-4">
              <DialogTitle>
                {isAddingSong ? "Add Song" : "Edit Song"}
              </DialogTitle>
              <DialogDescription>
                {!song && "Add a title and then continue to PDF uploads"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
              <SongTitleInput
                title={title}
                onSetTitle={setTitle}
                hasSong={song !== null}
                titleError={validationErrors.title}
              />

              {song !== null && (
                <section aria-label="Song version" className="space-y-6">
                  <VersionControls
                    versionId={versionId}
                    versionOptions={versionOptions}
                    onSelectVersion={handleSelectVersion}
                    onCreateEmptyDraft={handleCreateEmptyDraft}
                    isDirty={isDirty}
                    isCreatingVersion={createSongVersionMutation.isPending}
                  />

                  {versionId === null ? (
                    <p>This song has no version.</p>
                  ) : instrumentsPending ? (
                    <p>Loading instruments...</p>
                  ) : instrumentsError ? (
                    <p>Failed to load instruments.</p>
                  ) : (
                    <>
                      {isPublished && (
                        <p className="text-sm text-muted-foreground">
                          Published version. PDFs are read-only.
                        </p>
                      )}
                      <ScoreSection
                        score={score}
                        isPublished={isPublished}
                        onAddScoreFile={addScoreFile}
                        onRemoveScore={handleRemoveScore}
                        onPreviewFile={handlePreviewFile}
                      />

                      <PartsSection
                        parts={parts}
                        instruments={instruments}
                        partErrors={validationErrors.parts}
                        isPublished={isPublished}
                        onAddPartFiles={addPartFiles}
                        onUpdatePart={updateEditablePart}
                        onRemovePart={handleRemovePart}
                        onReplaceFile={replacePartFile}
                        onAddInstrumentConnection={addInstrumentConnection}
                        onRemoveInstrumentConnection={
                          removeInstrumentConnection
                        }
                        onPreviewFile={handlePreviewFile}
                      />
                    </>
                  )}
                </section>
              )}

              {song === null ? (
                <AddSongFooter
                  disabled={
                    !title.trim() ||
                    createSongMutation.isPending ||
                    createSongVersionMutation.isPending
                  }
                  onCancel={() => onOpenChange(false)}
                  onCreateSong={handleCreateSong}
                />
              ) : (
                <EditSongFooter
                  isPublished={isPublished}
                  isSaving={saveDraftMutation.isPending}
                  saveDisabled={
                    !isDirty || saveDraftMutation.isPending || !isValid
                  }
                  publishDisabled={
                    versionId === null ||
                    !isValid ||
                    !hasScore ||
                    saveDraftMutation.isPending
                  }
                  onClose={requestClose}
                  onSave={handleSaveDraft}
                  onPublish={() => setConfirmPublish(true)}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UnsavedChangesOnVersionSwitchDialog
        open={pendingVersionId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingVersionId(null);
        }}
        onDiscardAndSwitch={() => {
          if (pendingVersionId === null) return;

          switchVersion(pendingVersionId);
          setPendingVersionId(null);
        }}
      />

      <UnsavedChangesOnCloseDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        onDiscardAndClose={() => {
          setConfirmClose(false);
          onOpenChange(false);
        }}
      />

      <PdfPreviewDialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        file={previewFile}
        title={preview?.title}
        isLoading={previewIsLoading}
        error={previewError}
      />

      <SaveDraftErrorDialog
        open={saveErrorOpen}
        onOpenChange={setSaveErrorOpen}
        onCloseAndReload={() => {
          setEditedScore(null);
          setEditedParts(null);
          setSaveErrorOpen(false);
          onOpenChange(false);
        }}
      />

      <ConfirmPublishDialog
        open={confirmPublish}
        onOpenChange={handleConfirmPublishOpenChange}
        onPublish={handlePublishVersion}
        score={score}
        parts={parts}
        instruments={instruments}
        isSaving={saveDraftMutation.isPending}
        isPublishing={publishSongVersionMutation.isPending}
        publishError={publishSongVersionMutation.isError}
      />

      {pendingPartUpload !== null && (
        <PartUploadDuplicatesDialog
          conflicts={pendingPartUpload.conflicts}
          onActionChange={resolveSinglePartConflict}
          onAllActionChange={resolveAllPartConflicts}
        />
      )}
    </>
  );
}
