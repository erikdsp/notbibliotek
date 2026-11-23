package application

import (
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type SongDetails struct {
	Song             domain.Song
	CurrentVersionID *ulid.ULID
	Versions         []VersionDetails
}

type VersionDetails struct {
	Version SongVersionDetails
	Score   *ScoreDetails
	Parts   []PartDetails
}

type SongVersionDetails struct {
	ID          ulid.ULID
	PublishedAt *time.Time
	CreatedAt   time.Time
}

type ScoreDetails struct {
	ID   ulid.ULID
	File domain.File
}

type PartDetails struct {
	ID   ulid.ULID
	Key  string
	Name string
	File domain.File
}

type SongQuery struct {
	IncludeArchived         bool
	Search                  string
	Concerts                []string
	Parts                   []string
	Instruments             []string
	IncludeUnconnectedParts bool
	IncludeScore            bool
}

type SongByIDQuery struct {
	Parts                   []string
	Instruments             []string
	IncludeUnconnectedParts bool
	IncludeScore            bool
}

func getVersionByID(versions []VersionDetails, versionID ulid.ULID) *VersionDetails {
	for i := range versions {
		if versions[i].Version.ID == versionID {
			return &versions[i]
		}
	}
	return nil
}
