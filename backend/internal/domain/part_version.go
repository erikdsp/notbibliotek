package domain

import (
	"github.com/oklog/ulid/v2"
)

type PartVersion struct {
	ID            ulid.ULID
	SongVersionID ulid.ULID
	PartID        ulid.ULID
	FileID        ulid.ULID
}
