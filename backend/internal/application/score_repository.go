package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type ScoreRepository interface {
	Create(score domain.Score) error
	GetByID(id ulid.ULID) (domain.Score, error)
	GetBySongVersionID(songVersionID ulid.ULID) (domain.Score, error)
	Update(score domain.Score) error
}
