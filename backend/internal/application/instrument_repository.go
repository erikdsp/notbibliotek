package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type InstrumentRepository interface {
	Create(instrument domain.Instrument) error
	GetByID(id ulid.ULID) (domain.Instrument, error)
	GetAll() ([]domain.Instrument, error)
	Update(instrument domain.Instrument) error
	Delete(id ulid.ULID) error
}
