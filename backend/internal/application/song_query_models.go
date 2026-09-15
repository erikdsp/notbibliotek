package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

// type for representing a song with rich version data
type SongDetails struct {
	Song             domain.Song
	CurrentVersionID *ulid.ULID
	Versions         []VersionDetails
}

// type for representing details about a song version
type VersionDetails struct {
	Version domain.SongVersion
	Score   domain.Score
	Parts   []domain.Part
}

// type for handling query parameters for multiple songs
type SongQuery struct {
	Archived     bool
	Search       string
	Concert      string
	Part         string
	Instrument   string
	IncludeScore bool
}

// type for handling query parameters for a single song
type SongByIDQuery struct {
	Part         string
	Instrument   string
	IncludeScore bool
}
