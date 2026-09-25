package application

import (
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

// SongDetails contains a song and rich version data.
type SongDetails struct {
	Song             domain.Song
	CurrentVersionID *ulid.ULID
	Versions         map[ulid.ULID]*VersionDetails
}

// VersionDetails contains rich details about a song version
type VersionDetails struct {
	Version SongVersionDetails
	Score   *ScoreDetails
	Parts   []PartDetails
}

// Internal type for song version data used by VersionDetails
type SongVersionDetails struct {
	ID          ulid.ULID
	PublishedAt *time.Time
}

// Internal type for score data used by VersionDetails
type ScoreDetails struct {
	ID     ulid.ULID
	FileID ulid.ULID
}

// Internal type for part data used by VersionDetails
type PartDetails struct {
	ID     ulid.ULID
	Key    string
	Name   string
	FileID ulid.ULID
}

// type for handling query parameters for multiple songs
type SongQuery struct {
	Archived     bool
	Search       string
	Concerts     []string
	Parts        []string
	Instruments  []string
	IncludeScore bool
}

// type for handling query parameters for a single song
type SongByIDQuery struct {
	Parts        []string
	Instruments  []string
	IncludeScore bool
}
