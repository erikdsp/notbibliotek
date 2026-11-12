package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type PartRepository interface {
	Create(part domain.Part) error
	GetByID(partID ulid.ULID) (domain.Part, error)

	// Returns an empty slice when the song version has no parts.
	GetBySongVersionID(songVersionID ulid.ULID) ([]domain.Part, error)
	Update(part domain.Part) error
	Delete(partID ulid.ULID) (fileID ulid.ULID, err error)
	CreatePartsAndConnections(parts []domain.Part, partInstruments []PartInstruments) error
}
