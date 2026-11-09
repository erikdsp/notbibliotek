export type EditablePart = {
  local_id: string;
  id: string | null;
  key: string;
  name: string;
  file_id: string | null;
  file_name: string;
  file: File | null;
  instrument_ids: string[];
};

export type EditableScore = {
  file_id: string | null;
  file_name: string | null;
  file: File | null;
};

export type ScoreEdits = {
  versionId: string;
  score: EditableScore | null;
};

export type PartsEdits = {
  versionId: string;
  parts: EditablePart[];
};

export type FileConflict = {
  file: File;
  existingPartLocalId: string;
  existingPartName: string;
};

export type PendingPartUpload = {
  versionId: string;
  conflicts: FileConflict[];
};