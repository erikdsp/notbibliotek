package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type SongDetails struct {
	Song             domain.Song
	CurrentVersionID *ulid.ULID
	Versions         []VersionDetails
}

type VersionDetails struct {
	Version domain.SongVersion
	Score   domain.Score
	Parts   []domain.Part
}

type SongQuery struct {
	Archived     bool
	Search       string
	Concert      string
	Part         string
	Instrument   string
	IncludeScore bool
}

type SongByIDQuery struct {
	Part         string
	Instrument   string
	IncludeScore bool
}

type SongRepository interface {
	Create(song domain.Song) error
	GetByID(id ulid.ULID) (domain.Song, error)
	GetAll(archived bool) ([]domain.Song, error)
	Update(song domain.Song) error
}
