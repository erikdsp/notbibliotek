package domain

import (
	"github.com/oklog/ulid/v2"
)

type Score struct {
	ID            ulid.ULID
	SongVersionID ulid.ULID
	FileID        ulid.ULID
}
