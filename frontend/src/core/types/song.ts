export type Song = {
  id: string;
  title: string;
  archived_at: string | null;
};

export type SongVersion = {
  id: string;
  song_id: string;
  published_at: string | null;
};