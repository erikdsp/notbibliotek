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
	Score   *ScoreDetails
	Parts   []PartDetails
}

type ScoreDetails struct {
	Score domain.Score
	File  domain.File
}

type PartDetails struct {
	Part        domain.Part
	File        domain.File
	Instruments []domain.Instrument
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
	GetByIDWithDetails(id ulid.ULID, query SongByIDQuery) (SongDetails, error)
	GetAll() ([]domain.Song, error)
	GetAllWithDetails(query SongQuery) ([]SongDetails, error)
	Update(song domain.Song) error
}
