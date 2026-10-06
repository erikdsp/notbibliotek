export type ConcertResponse = {
  id: string;
  key: string;
  name: string;
  date: string;
  songs: ConcertSong[];
};

export type ConcertSong = {
  id: string;
  title: string;
  archived_at: string;
}