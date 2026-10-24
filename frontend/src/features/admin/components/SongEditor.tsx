import { useRef, useState } from "react";
import { Eye, FileText, Plus, Upload, X } from "lucide-react";

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

type EditablePart = {
  local_id: string;
  id: string | null;
  key: string;
  name: string;
  file_id: string | null;
  file: File | null;
  instrument_ids: string[];
};

type EditableScore = {
  file_id: string | null;
  file: File | null;
  name: string;
};

type SongEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: SongResponse | null;
  instruments: Instrument[];
};

function createLocalId() {
  return crypto.randomUUID();
}

function suggestPartKey(filename: string) {
  const name = filename
    .replace(/\.pdf$/i, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const matches = [
    { pattern: /\bviolin\s*(?:i|1)\b/, key: "violin1" },
    { pattern: /\bviolin\s*(?:ii|2)\b/, key: "violin2" },
    { pattern: /\bviolin\b/, key: "violin" },
    { pattern: /\bviola\b/, key: "viola" },
    { pattern: /\bcello\b/, key: "cello" },
    { pattern: /\bflute\b/, key: "flute" },
    { pattern: /\bclarinet\b/, key: "clarinet" },
  ];

  return matches.find(({ pattern }) => pattern.test(name))?.key ?? "";
}

function makeEditableParts(
  song: SongResponse | null,
  versionId: string | null,
): EditablePart[] {
  const version = song?.versions.find(
    (version) => version.song_version_id === versionId,
  );

  return (
    version?.parts.map((part) => ({
      local_id: part.id,
      id: part.id,
      key: part.key,
      name: part.name,
      file_id: part.file_id,
      file: null,
      instrument_ids: [],
    })) ?? []
  );
}

function makeEditableScore(
  song: SongResponse | null,
  versionId: string | null,
): EditableScore | null {
  const version = song?.versions.find(
    (version) => version.song_version_id === versionId,
  );

  if (!version?.score) return null;

  return {
    file_id: version.score.file_id,
    file: null,
    name: "Score.pdf",
  };
}

// Selects the first unpublished draft, or the current published version if no draft exists.
function initialVersionId(song: SongResponse | null) {
  if (!song) return null;

  const draft = song.versions.find((version) => version.published_at === null);

  return draft?.song_version_id ?? song.current_version_id;
}

export function SongEditor({
  open,
  onOpenChange,
  song,
  instruments,
}: SongEditorProps) {
  const [title, setTitle] = useState(song?.title ?? "");
  const [versionId, setVersionId] = useState<string | null>(() =>
    initialVersionId(song),
  );
  const [score, setScore] = useState<EditableScore | null>(() =>
    makeEditableScore(song, initialVersionId(song)),
  );
  const [parts, setParts] = useState<EditablePart[]>(() =>
    makeEditableParts(song, initialVersionId(song)),
  );

  const scoreInputRef = useRef<HTMLInputElement>(null);
  const partsInputRef = useRef<HTMLInputElement>(null);

  const selectedVersion = song?.versions.find(
    (version) => version.song_version_id === versionId,
  );

  const isPublished = selectedVersion?.published_at != null;

  function selectVersion(nextVersionId: string | null) {
    setVersionId(nextVersionId);
    setScore(makeEditableScore(song, nextVersionId));
    setParts(makeEditableParts(song, nextVersionId));
  }

  function selectScore(file: File) {
    if (file.type !== "application/pdf") return;

    setScore({
      file_id: null,
      file,
      name: file.name,
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
          file,
          instrument_ids: matchingInstrument ? [matchingInstrument.id] : [],
        };
      });

    setParts((current) => [...current, ...newParts]);
  }

  function updatePart(localId: string, update: Partial<EditablePart>) {
    setParts((current) =>
      current.map((part) =>
        part.local_id === localId ? { ...part, ...update } : part,
      ),
    );
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

              <Button disabled={!title.trim()}>Create & Continue</Button>
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
                    <Plus />
                    New Draft from Version
                  </Button>
                </div>
              </div>

              {/* <div className="flex items-end gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Label>Version</Label>

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
                </div>

                <Button variant="outline" disabled >
                  <Plus />
                  New Version
                </Button>
              </div> */}

              {isPublished && (
                <p className="text-sm text-muted-foreground">
                  Published version. PDFs are read-only.
                </p>
              )}

              {/* Score */}
              <section className="space-y-3">
                <h3 className="font-semibold">Score</h3>

                {score && (
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />

                    <span className="min-w-0 truncate text-sm">
                      {score.name}
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
                        onClick={() => setScore(null)}
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
                          {part.file?.name ?? part.name}
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

                        {part.id === null && (
                          <Badge variant="secondary">New</Badge>
                        )}

                        <div className="flex-1" />

                        {!isPublished && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Remove ${part.name}`}
                            onClick={() =>
                              setParts((current) =>
                                current.filter(
                                  (item) => item.local_id !== part.local_id,
                                ),
                              )
                            }
                          >
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
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
                                    onClick={() => toggleInstrument(part, id)}
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
                                        toggleInstrument(part, instrument.id)
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

              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>

                <Button variant="outline" disabled>
                  Save Draft
                </Button>

                <Button disabled>Publish Version</Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
