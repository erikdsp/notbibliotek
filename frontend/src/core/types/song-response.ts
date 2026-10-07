export type SongResponse = {
  id: string;
  title: string;
  archived_at: string | null;
  current_version_id: string | null;
  versions: Version[];
};

export type Version = {
  song_version_id: string;
  published_at: string | null;
  score: VersionScore | null;
  parts: VersionPart[];
};

export type VersionScore = {
  id: string;
  file_id: string;
};

export type VersionPart = {
  id: string;
  key: string;
  name: string;
  file_id: string;
};