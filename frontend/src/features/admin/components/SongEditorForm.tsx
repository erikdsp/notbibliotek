import { useRef, useState } from "react";
import {
  Eye,
  FileText,
  Plus,
  Upload,
  X,
  CopyPlus,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import type { SongResponse, Instrument } from "@/core/types";
import { formatSongVersion } from "@/utils/song-utils";
import { useCreateSong, useCreateSongVersion } from "@/hooks";
import { createLogger } from "@/utils/logger";
import type { EditablePart, EditableScore } from "@/features/admin/types";
import {
  makeEditableParts,
  makeEditableScore,
} from "@/features/admin/mappers/make-editable";
import { suggestPartMetadata } from "@/features/admin/lib/suggest-part-metadata";
import { initialVersionId } from "@/features/admin/lib/initial-version-id";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePartInstruments } from "@/hooks/use-part-instruments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveSongDraft } from "@/features/admin/services/save-song-draft";
import { refetchSongQueries } from "@/features/admin/lib/refetch-song-queries";
import { validateSongDraft } from "@/features/admin/lib/validate-song-draft";
import { defaultInstrumentMappings } from "@/features/admin/lib/default-instrument-mappings";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePublishSongVersion } from "@/hooks/use-publish-song-version";

const log = createLogger("SongEditorForm");

function createLocalId() {
  return crypto.randomUUID();
}

type ScoreEdits = {
  versionId: string;
  score: EditableScore | null;
};

type PartsEdits = {
  versionId: string;
  parts: EditablePart[];
};

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
  const [pendingVersionId, setPendingVersionId] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [saveErrorOpen, setSaveErrorOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const titleIsDirty = title !== (song?.title ?? "");
  const originalScore = makeEditableScore(song, versionId);

  const score =
    editedScore?.versionId === versionId ? editedScore.score : originalScore;

  const scoreIsDirty =
    score?.file_id !== originalScore?.file_id || score?.file != null;

  const originalParts =
    partInstruments !== undefined
      ? makeEditableParts(song, versionId, partInstruments)
      : null;

  const parts =
    editedParts?.versionId === versionId ? editedParts.parts : originalParts;

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
      part.key !== original.key ||
      part.name !== original.name ||
      part.file_id !== original.file_id ||
      part.file != null ||
      part.instrument_ids.length !== original.instrument_ids.length ||
      part.instrument_ids.some((id) => !original.instrument_ids.includes(id))
    );
  }

  const partsAreDirty =
    originalParts !== null &&
    parts !== null &&
    (parts.length !== originalParts.length ||
      parts.some((part) => partHasChanged(part, originalParts)));

  const versionIsDirty = scoreIsDirty || partsAreDirty;
  const isDirty = titleIsDirty || versionIsDirty;

  const validationErrors = validateSongDraft(title, parts);

  const isValid =
    validationErrors.title === undefined &&
    score !== null &&
    Object.keys(validationErrors.parts).length === 0;

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

  const scoreInputRef = useRef<HTMLInputElement>(null);
  const partsInputRef = useRef<HTMLInputElement>(null);

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

  const selectedVersion = song?.versions.find(
    (version) => version.song_version_id === versionId,
  );

  const isPublished = selectedVersion?.published_at != null;

  function switchVersion(nextVersionId: string | null) {
    setVersionId(nextVersionId);
    setEditedScore(null);
    setEditedParts(null);
  }

  function selectVersion(nextVersionId: string | null) {
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
    if (versionId === null || originalParts === null) return;

    const newParts = Array.from(files)
      .filter((file) => file.type === "application/pdf")
      .map((file): EditablePart => {
        const { key, name } = suggestPartMetadata(file.name);
        const instrumentKeys = defaultInstrumentMappings[key] ?? [];
        const instrumentIds = instruments
          .filter((instrument) => instrumentKeys.includes(instrument.key))
          .map((instrument) => instrument.id);

        return {
          local_id: createLocalId(),
          id: null,
          key,
          name,
          file_id: null,
          file_name: file.name,
          file,
          instrument_ids: instrumentIds,
        };
      });

    setEditedParts((current) => ({
      versionId,
      parts: [
        ...(current?.versionId === versionId ? current.parts : originalParts),
        ...newParts,
      ],
    }));
  }

  function updatePart(localId: string, update: Partial<EditablePart>) {
    if (versionId === null || originalParts === null) return;

    setEditedParts((current) => ({
      versionId,
      parts: (current?.versionId === versionId
        ? current.parts
        : originalParts
      ).map((part) =>
        part.local_id === localId ? { ...part, ...update } : part,
      ),
    }));
  }

  function toggleInstrument(part: EditablePart, instrumentId: string) {
    const selected = part.instrument_ids.includes(instrumentId);

    updatePart(part.local_id, {
      instrument_ids: selected
        ? part.instrument_ids.filter((id) => id !== instrumentId)
        : [...part.instrument_ids, instrumentId],
    });
  }

  function previewFile(file: File | null) {
    if (!file) return;

    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");

    // URL cleanup will be handled when preview functionality
    // is connected to the persisted file endpoints.
  }

  const versionOptions =
    song?.versions.map((version) => {
      const label = formatSongVersion(song, version.song_version_id) ?? "Draft";

      return {
        value: version.song_version_id,
        label:
          label +
          (version.song_version_id === song.current_version_id
            ? " (Current)"
            : ""),
      };
    }) ?? [];

  const selectedVersionLabel = versionOptions.find(
    (option) => option.value === versionId,
  )?.label;

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
    if (song === null || versionId === null || isPublished || !isValid) {
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
              {/* Song title */}
              <div className="space-y-2">
                <Label htmlFor="song-title">Song Title</Label>
                <Input
                  id="song-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Song title"
                  className={song === null ? "w-full" : "w-[66%]"}
                />

                {validationErrors.title && (
                  <p className="text-sm text-muted-foreground">(required)</p>
                )}
              </div>

              {song === null ? (
                <DialogFooter>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>

                  <Button
                    disabled={
                      !title.trim() ||
                      createSongMutation.isPending ||
                      createSongVersionMutation.isPending
                    }
                    onClick={handleCreateSong}
                  >
                    Create & Continue
                  </Button>
                </DialogFooter>
              ) : (
                <>
                  {/* Version selector */}

                  <div className="space-y-2">
                    <Label>Version</Label>

                    <div className="flex items-center gap-3">
                      <Select value={versionId} onValueChange={selectVersion}>
                        <SelectTrigger className="w-2/3">
                          <SelectValue placeholder="Select version">
                            {selectedVersionLabel}
                          </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                          {versionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button variant="outline" disabled className="ml-auto">
                        <CopyPlus />
                        New Duplicate Draft
                      </Button>

                      <Tooltip>
                        <TooltipTrigger render={<span />}>
                          <Button
                            variant="outline"
                            disabled={
                              isDirty || createSongVersionMutation.isPending
                            }
                            onClick={handleCreateEmptyDraft}
                          >
                            <Plus />
                            New Empty Draft
                          </Button>
                        </TooltipTrigger>

                        {isDirty && (
                          <TooltipContent>
                            Save or discard changes before creating a new draft.
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>
                  </div>

                  {isPublished && (
                    <p className="text-sm text-muted-foreground">
                      Published version. PDFs are read-only.
                    </p>
                  )}

                  {/* Version Editing */}
                  {versionId === null ? (
                    <p>This song has no version.</p>
                  ) : instrumentsPending ? (
                    <p>Loading instruments...</p>
                  ) : instrumentsError ? (
                    <p>Failed to load instruments.</p>
                  ) : (
                    <>
                      {/* Score */}
                      <section className="space-y-3">
                        <h3 className="font-semibold">Score</h3>

                        {score && (
                          <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                            <FileText className="size-4 shrink-0 text-muted-foreground" />

                            <span className="min-w-0 truncate text-sm">
                              {score.file_name}
                            </span>

                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Preview score"
                              disabled={!score.file}
                              onClick={() => previewFile(score.file)}
                            >
                              <Eye className="size-4" />
                            </Button>

                            <div className="flex-1" />

                            {!isPublished && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Remove score"
                                onClick={handleRemoveScore}
                              >
                                <X className="size-4" />
                              </Button>
                            )}
                          </div>
                        )}

                        {!isPublished && (
                          <div
                            className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              const file = event.dataTransfer.files[0];
                              if (file) addScoreFile(file);
                            }}
                          >
                            <Upload className="size-5 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Drop a Score PDF here
                            </p>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => scoreInputRef.current?.click()}
                            >
                              Select Score
                            </Button>

                            <input
                              ref={scoreInputRef}
                              type="file"
                              accept="application/pdf,.pdf"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) addScoreFile(file);
                                event.target.value = "";
                              }}
                            />
                          </div>
                        )}
                      </section>

                      {/* Parts */}
                      <section className="space-y-3">
                        <h3 className="font-semibold">Parts</h3>

                        {!isPublished && (
                          <div
                            className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              addPartFiles(event.dataTransfer.files);
                            }}
                          >
                            <Upload className="size-5 text-muted-foreground" />

                            <p className="text-sm text-muted-foreground">
                              Drop Part PDFs here
                            </p>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => partsInputRef.current?.click()}
                            >
                              Select Parts
                            </Button>

                            <input
                              ref={partsInputRef}
                              type="file"
                              accept="application/pdf,.pdf"
                              multiple
                              className="hidden"
                              onChange={(event) => {
                                if (event.target.files) {
                                  addPartFiles(event.target.files);
                                }
                                event.target.value = "";
                              }}
                            />
                          </div>
                        )}

                        <div className="space-y-3">
                          {parts !== null &&
                            parts.map((part) => {
                              const partErrors =
                                validationErrors.parts[part.local_id];
                              return (
                                <div
                                  key={part.local_id}
                                  className="space-y-3 rounded-lg border p-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="size-4 shrink-0 text-muted-foreground" />

                                    <span className="min-w-0 truncate text-sm">
                                      {part.file_name ?? part.name}
                                    </span>

                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label={`Preview ${part.name}`}
                                      disabled={!part.file}
                                      onClick={() => previewFile(part.file)}
                                    >
                                      <Eye className="size-4" />
                                    </Button>

                                    <div className="flex-1" />

                                    {!isPublished && (
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Remove ${part.name}`}
                                        onClick={() =>
                                          handleRemovePart(part.local_id)
                                        }
                                      >
                                        <X className="size-4" />
                                      </Button>
                                    )}
                                  </div>

                                  <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="space-y-2">
                                      <Label>Part Name</Label>
                                      <Input
                                        value={part.name}
                                        disabled={isPublished}
                                        onChange={(event) =>
                                          updatePart(part.local_id, {
                                            name: event.target.value,
                                          })
                                        }
                                        aria-invalid={!!partErrors?.name}
                                      />
                                      {partErrors?.name && (
                                        <p className="text-sm text-destructive">
                                          {partErrors.name}
                                        </p>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Part Key</Label>
                                      <Input
                                        value={part.key}
                                        disabled={isPublished}
                                        onChange={(event) =>
                                          updatePart(part.local_id, {
                                            key: event.target.value,
                                          })
                                        }
                                        aria-invalid={!!partErrors?.key}
                                        placeholder="e.g. violin1"
                                      />
                                      {partErrors?.key && (
                                        <p className="text-sm text-destructive">
                                          {partErrors.key}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Instruments</Label>

                                      <div className="flex min-h-9 flex-wrap items-center gap-1 rounded-md border px-2 py-1">
                                        {part.instrument_ids.map((id) => {
                                          const instrument = instruments.find(
                                            (instrument) =>
                                              instrument.id === id,
                                          );

                                          if (!instrument) return null;

                                          return (
                                            <Badge
                                              key={id}
                                              variant="secondary"
                                              className="gap-1"
                                            >
                                              {instrument.name}

                                              <button
                                                type="button"
                                                aria-label={`Remove ${instrument.name}`}
                                                onClick={() =>
                                                  toggleInstrument(part, id)
                                                }
                                              >
                                                <X className="size-3" />
                                              </button>
                                            </Badge>
                                          );
                                        })}

                                        <Popover>
                                          <PopoverTrigger
                                            render={
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7"
                                              />
                                            }
                                          >
                                            <Plus className="size-3" />
                                            Add instrument
                                          </PopoverTrigger>

                                          <PopoverContent
                                            align="start"
                                            className="w-56 space-y-2"
                                          >
                                            {instruments.map((instrument) => (
                                              <label
                                                key={instrument.id}
                                                className="flex cursor-pointer items-center gap-2 text-sm"
                                              >
                                                <Checkbox
                                                  checked={part.instrument_ids.includes(
                                                    instrument.id,
                                                  )}
                                                  onCheckedChange={() =>
                                                    toggleInstrument(
                                                      part,
                                                      instrument.id,
                                                    )
                                                  }
                                                />

                                                {instrument.name}
                                              </label>
                                            ))}
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </section>
                    </>
                  )}

                  {/* Dialog Footer Actions */}
                  <DialogFooter>
                    <Button variant="outline" onClick={requestClose}>
                      Close
                    </Button>

                    <Button
                      variant={isPublished ? "default" : "outline"}
                      disabled={
                        !isDirty || saveDraftMutation.isPending || !isValid
                      }
                      onClick={handleSaveDraft}
                    >
                      {saveDraftMutation.isPending
                        ? "Saving..."
                        : isPublished
                          ? "Save Changes"
                          : "Save Draft"}
                    </Button>

                    {!isPublished && (
                      <Button
                        disabled={
                          versionId === null ||
                          !isValid ||
                          saveDraftMutation.isPending
                        }
                        onClick={() => setConfirmPublish(true)}
                      >
                        Publish Version
                      </Button>
                    )}
                  </DialogFooter>

                  <AlertDialog
                    open={pendingVersionId !== null}
                    onOpenChange={(open) => {
                      if (!open) setPendingVersionId(null);
                    }}
                  >
                    <AlertDialogContent overlayClassName="bg-black/40 supports-backdrop-filter:backdrop-blur-[1px]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Discard unsaved changes?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Your unsaved changes to Score and Parts will be lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => {
                            if (pendingVersionId === null) return;

                            switchVersion(pendingVersionId);
                            setPendingVersionId(null);
                          }}
                        >
                          Discard & Switch
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog
                    open={confirmClose}
                    onOpenChange={setConfirmClose}
                  >
                    <AlertDialogContent overlayClassName="bg-black/40 supports-backdrop-filter:backdrop-blur-[0.5px]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Discard unsaved changes?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Your unsaved changes will be lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Editing</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => {
                            setConfirmClose(false);
                            onOpenChange(false);
                          }}
                        >
                          Discard Changes
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog
                    open={saveErrorOpen}
                    onOpenChange={setSaveErrorOpen}
                  >
                    <AlertDialogContent overlayClassName="bg-black/40 supports-backdrop-filter:backdrop-blur-[0.5px]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Save Draft failed</AlertDialogTitle>
                        <AlertDialogDescription>
                          Some changes may have been saved successfully. You can
                          close the editor and reload the saved data, or keep
                          editing. Retrying Save Draft may fail because some
                          changes have already been saved.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Editing</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => {
                            setEditedScore(null);
                            setEditedParts(null);
                            setSaveErrorOpen(false);
                            onOpenChange(false);
                          }}
                        >
                          Close and Reload (Recommended)
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmPublish}
        onOpenChange={handleConfirmPublishOpenChange}
      >
        <DialogContent
          className="flex max-h-[90vh] w-[95vw] sm:max-w-6xl flex-col overflow-hidden"
          overlayClassName="bg-black/20 supports-backdrop-filter:backdrop-blur-[0px]"
        >
          <DialogHeader>
            <DialogTitle>Publish Version?</DialogTitle>
            <DialogDescription>
              Review the score and parts before publishing this version.
            </DialogDescription>
            {publishSongVersionMutation.isError && (
              <p role="alert" className="text-sm text-destructive">
                Failed to publish version. Please try again.
              </p>
            )}
          </DialogHeader>

          <div className="-mr-5 min-h-0 flex-1 space-y-5 overflow-y-auto py-2 pr-4">
            {/* Score */}
            <section className="space-y-2">
              <h3 className="px-3 text-sm font-semibold">Score</h3>
              <div className="rounded-md px-3 py-2 text-sm">
                {score?.file_name ?? "No score"}
              </div>
            </section>

            {/* Parts */}
            <section className="space-y-2">
              <h3 className="px-3 text-sm font-semibold">
                Parts ({parts?.length ?? 0})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Key</th>
                      <th className="px-3 py-2 font-medium">Instruments</th>
                      <th className="px-3 py-2 font-medium">File</th>
                    </tr>
                  </thead>

                  <tbody>
                    {parts?.map((part) => (
                      <tr
                        key={part.local_id}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2">{part.name}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {part.key}
                        </td>
                        <td className="px-3 py-2">
                          {part.instrument_ids.length > 0 ? (
                            part.instrument_ids
                              .map(
                                (id) =>
                                  instruments.find((i) => i.id === id)?.name,
                              )
                              .filter(Boolean)
                              .join(", ")
                          ) : (
                            <span className="inline-flex items-center gap-1.5">
                              <AlertTriangle className="size-4 text-amber-600" />
                              None
                            </span>
                          )}
                        </td>
                        <td className="max-w-48 truncate px-3 py-2">
                          {part.file_name ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <DialogFooter className="shrink-0">
            <Button
              variant="outline"
              onClick={() => handleConfirmPublishOpenChange(false)}
            >
              Keep Editing
            </Button>
            <Button
              disabled={
                saveDraftMutation.isPending ||
                publishSongVersionMutation.isPending
              }
              onClick={handlePublishVersion}
            >
              {saveDraftMutation.isPending
                ? "Saving..."
                : publishSongVersionMutation.isPending
                  ? "Publishing..."
                  : "Publish Version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
