package domain

import (
	"time"

	"github.com/oklog/ulid/v2"
)

type Song struct {
	ID         ulid.ULID
	Title      string
	ArchivedAt *time.Time
}
