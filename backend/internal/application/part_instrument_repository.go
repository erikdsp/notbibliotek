package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

// Internal type for Concert with Song Details
type PartInstruments struct {
	PartID      ulid.ULID
	Instruments []domain.Instrument
}

type PartInstrumentRepository interface {
	Create(partID ulid.ULID, instrumentID ulid.ULID) error
	Delete(partID ulid.ULID, instrumentID ulid.ULID) error
	GetBySongVersionID(songVersionID ulid.ULID) ([]PartInstruments, error)
}
