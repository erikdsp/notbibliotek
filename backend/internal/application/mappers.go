package application

func (query DownloadConcertQuery) ToSongQuery(concertKey string) SongQuery {
	return SongQuery{
		Concerts:                []string{concertKey},
		Instruments:             query.Instruments,
		IncludeUnconnectedParts: query.IncludeUnconnectedParts,
	}
}
