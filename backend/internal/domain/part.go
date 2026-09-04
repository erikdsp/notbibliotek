package domain

import (
	"github.com/oklog/ulid/v2"
)

type Part struct {
	ID            ulid.ULID
	Key           string
	Name          string
	SongVersionID ulid.ULID
	FileID        ulid.ULID
}
