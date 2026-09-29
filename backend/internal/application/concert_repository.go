package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type ConcertRepository interface {
	Create(concert domain.Concert) error
	GetAll() ([]domain.Concert, error)
	GetByID(id ulid.ULID) (domain.Concert, error)
	Update(concert domain.Concert) error
	Delete(id ulid.ULID) error
}
