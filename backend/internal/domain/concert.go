package domain

import (
	"time"

	"github.com/oklog/ulid/v2"
)

type Concert struct {
	ID   ulid.ULID
	Name string
	Date time.Time
}
