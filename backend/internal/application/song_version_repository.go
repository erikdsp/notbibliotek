package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type SongVersionRepository interface {
	Create(songVersion domain.SongVersion) error
	GetByID(id ulid.ULID) (domain.SongVersion, error)
}
