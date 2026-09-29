package application

import (
	"github.com/oklog/ulid/v2"
)

type ConcertSongRepository interface {
	Create(concertID ulid.ULID, songID ulid.ULID) error
	Delete(concertID ulid.ULID, songID ulid.ULID) error
}
