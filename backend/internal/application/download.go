package application

import (
	"fmt"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/erikdsp/notbibliotek/backend/internal/utils/set"

	"github.com/oklog/ulid/v2"
)

type DownloadQuery struct {
	Instruments             []string
	IncludeUnconnectedParts bool
}

func (query DownloadQuery) ToSongQuery() SongQuery {
	return SongQuery{
		Instruments:             query.Instruments,
		IncludeUnconnectedParts: query.IncludeUnconnectedParts,
	}
}

func (query DownloadQuery) ToSongQueryWithConcert(concertKey string) SongQuery {
	songQuery := query.ToSongQuery()
	songQuery.Concerts = []string{concertKey}
	return songQuery
}

func validateDownloadQuery(query DownloadQuery) error {
	if len(query.Instruments) == 0 && !query.IncludeUnconnectedParts {
		return fmt.Errorf("%w: instrument or include_unconnected_parts is required", ErrInvalidOperation)
	}
	return nil
}

func validateInstrumentKeys(keys []string, instrumentCount int) error {
	uniqueKeys := set.NewSet[string]()

	for _, key := range keys {
		uniqueKeys.Insert(key)
	}

	if instrumentCount != uniqueKeys.Len() {
		return ErrInstrumentNotFound
	}

	return nil
}

func getDownloadInstrumentNames(
	instruments []domain.Instrument,
	includeUnconnectedParts bool,
) []string {
	var names []string

	if includeUnconnectedParts {
		names = append(names, "Odd Parts")
	}

	for _, instrument := range instruments {
		names = append(names, instrument.Name)
	}

	return names
}

func getFileIDsFromPublishedSongs(songs []SongDetails) []ulid.ULID {
	var fileIDs []ulid.ULID
	for _, song := range songs {
		if song.CurrentVersionID == nil {
			continue
		}

		currentVersion := getVersionByID(song.Versions, *song.CurrentVersionID)
		if currentVersion == nil {
			continue
		}

		if currentVersion.Score != nil {
			fileIDs = append(fileIDs, currentVersion.Score.File.ID)
		}

		for _, part := range currentVersion.Parts {
			fileIDs = append(fileIDs, part.File.ID)
		}
	}

	return fileIDs
}

func getLatestIncludedVersionDate(songs []SongDetails) time.Time {
	var latestVersion time.Time

	for _, song := range songs {
		if song.CurrentVersionID == nil {
			continue
		}

		version := getVersionByID(song.Versions, *song.CurrentVersionID)
		if version == nil || (version.Score == nil && len(version.Parts) == 0) {
			continue
		}

		if publishedAt := version.Version.PublishedAt; publishedAt != nil &&
			publishedAt.After(latestVersion) {
			latestVersion = *publishedAt
		}
	}

	return latestVersion
}
