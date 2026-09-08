package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type FileRepository interface {
	Create(file domain.File) error
	GetByID(id ulid.ULID) (domain.File, error)
	Update(file domain.File) error
}
