import { useRef, useState } from "react";
import { Eye, FileText, Plus, Upload, X, CopyPlus } from "lucide-react";

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
import { suggestPartKey } from "@/features/admin/utils/suggest-part-key";
import { initialVersionId } from "@/features/admin/utils/initial-version-id";
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

const log = createLogger("SongVersionEditor");

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

type SongVersionEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: SongResponse | null;
  instruments: Instrument[];
  onSongCreated: (songId: string) => void;
};

export function SongVersionEditor({
  open,
  onOpenChange,
  song,
  instruments,
  onSongCreated,
}: SongVersionEditorProps) {
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
    editedParts?.versionId === versionId
      ? editedParts.parts
      : (originalParts ?? []);

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
    (parts.length !== originalParts.length ||
      parts.some((part) => partHasChanged(part, originalParts)));

  const versionIsDirty = scoreIsDirty || partsAreDirty;
  const isDirty = titleIsDirty || versionIsDirty;

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

  function selectScore(file: File) {
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

  function selectParts(files: FileList | File[]) {
    const newParts = Array.from(files)
      .filter((file) => file.type === "application/pdf")
      .map((file): EditablePart => {
        const key = suggestPartKey(file.name);

        const matchingInstrument = instruments.find(
          (instrument) => instrument.key === key,
        );

        return {
          local_id: createLocalId(),
          id: null,
          key,
          name: file.name.replace(/\.pdf$/i, ""),
          file_id: null,
          file_name: file.name,
          file,
          instrument_ids: matchingInstrument ? [matchingInstrument.id] : [],
        };
      });

    if (versionId === null || originalParts === null) return;

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{song ? "Edit Song" : "Add Song"}</DialogTitle>
          <DialogDescription>
            {song
              ? "A song version contains one score and any number of parts. "
              : "Add a title and then continue to PDF uploads"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Song title */}
          <div className="space-y-2">
            <Label htmlFor="song-title">Song title</Label>
            <Input
              id="song-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Song title"
            />
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
                    <SelectTrigger className="w-full">
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

                  <Button variant="outline" disabled>
                    <CopyPlus />
                    New Draft
                  </Button>
                  <Button variant="outline" disabled>
                    <Plus />
                    New Empty Draft
                  </Button>
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
                          if (file) selectScore(file);
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
                            if (file) selectScore(file);
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
                          selectParts(event.dataTransfer.files);
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
                              selectParts(event.target.files);
                            }
                            event.target.value = "";
                          }}
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      {parts.map((part) => (
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
                                onClick={() => handleRemovePart(part.local_id)}
                              >
                                <X className="size-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
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
                              />
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
                                placeholder="e.g. violin1"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Instruments</Label>

                              <div className="flex min-h-9 flex-wrap items-center gap-1 rounded-md border px-2 py-1">
                                {part.instrument_ids.map((id) => {
                                  const instrument = instruments.find(
                                    (instrument) => instrument.id === id,
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
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* Dialog Footer Actions */}
              <DialogFooter>
                <Button variant="outline" onClick={requestClose}>
                  Close
                </Button>

                <Button variant="outline" disabled>
                  Save Draft
                </Button>

                <Button disabled>Publish Version</Button>
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

              <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
