package domain

import (
	"github.com/oklog/ulid/v2"
)

type Part struct {
	ID     ulid.ULID
	SongID ulid.ULID
	Name   string
}
