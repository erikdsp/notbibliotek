package application

import (
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type FileRepository interface {
	Create(file domain.File) error
	GetByID(fileID ulid.ULID) (domain.File, error)
	Update(file domain.File) error
	DeleteIfUnreferenced(fileID ulid.ULID) (deleted bool, err error)
	GetLatestPublishedAt(fileIDs []ulid.ULID) (*time.Time, error)
}
