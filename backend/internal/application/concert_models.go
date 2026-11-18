package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
)

// Internal type for Concert with Song Details
type ConcertDetails struct {
	Concert domain.Concert
	Songs   []domain.Song
}
