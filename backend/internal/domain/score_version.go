package domain

import (
	"github.com/oklog/ulid/v2"
)

type ScoreVersion struct {
	ID            ulid.ULID
	SongVersionID ulid.ULID
	ScoreID       ulid.ULID
	FileID        ulid.ULID
}
