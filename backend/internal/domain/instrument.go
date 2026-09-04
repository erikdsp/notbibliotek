package domain

import (
	"github.com/oklog/ulid/v2"
)

type Instrument struct {
	ID   ulid.ULID
	Key  string
	Name string
}
