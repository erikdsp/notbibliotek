package domain

import (
	"time"

	"github.com/oklog/ulid/v2"
)

type Concert struct {
	ID   ulid.ULID
	Key  string
	Name string
	Date time.Time
}
