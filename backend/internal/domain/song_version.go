package domain

import (
	"time"

	"github.com/oklog/ulid/v2"
)

type SongVersion struct {
	ID          ulid.ULID
	SongID      ulid.ULID
	PublishedAt *time.Time
}
