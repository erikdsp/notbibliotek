export type EditablePart = {
  local_id: string;
  id: string | null;
  key: string;
  name: string;
  file_id: string | null;
  file_name: string | null;
  file: File | null;
  instrument_ids: string[];
};

export type EditableScore = {
  file_id: string | null;
  file_name: string | null;
  file: File | null;
};