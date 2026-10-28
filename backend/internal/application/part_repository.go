package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type PartRepository interface {
	Create(part domain.Part) error
	GetByID(id ulid.ULID) (domain.Part, error)

	// Returns an empty slice when the song version has no parts.
	GetBySongVersionID(songVersionID ulid.ULID) ([]domain.Part, error)
	Update(part domain.Part) error
	Delete(id ulid.ULID) (fileID ulid.ULID, err error)
}
