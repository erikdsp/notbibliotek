package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type SongVersionRepository interface {
	Create(songVersionID ulid.ULID, songID ulid.ULID) (domain.SongVersion, error)
	GetByID(songVersionID ulid.ULID) (domain.SongVersion, error)
	Publish(songVersion domain.SongVersion) error
	Delete(songVersionID ulid.ULID) error
}
