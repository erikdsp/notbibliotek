package application

import (
	"github.com/oklog/ulid/v2"
)

type SongQueryRepository interface {
	GetAll(query SongQuery) ([]SongDetails, error)
	GetByID(id ulid.ULID, query SongByIDQuery) (SongDetails, error)
}
