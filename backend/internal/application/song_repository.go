package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type SongRepository interface {
	Create(song domain.Song) error
	GetByID(id ulid.ULID) (domain.Song, error)
	GetAll() ([]domain.Song, error)
}
