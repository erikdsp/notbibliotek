package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
)

type SongVersionRepository interface {
	Create(songVersion domain.SongVersion) error
}
