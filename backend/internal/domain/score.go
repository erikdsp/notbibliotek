package domain

import (
	"github.com/oklog/ulid/v2"
)

type Score struct {
	ID     ulid.ULID
	SongID ulid.ULID
}
