package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
)

type ConcertDetails struct {
	Concert domain.Concert
	Songs   []domain.Song
}
