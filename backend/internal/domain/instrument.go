package domain

import (
	"github.com/oklog/ulid/v2"
)

type Instrument struct {
	ID   ulid.ULID
	Name string
}
