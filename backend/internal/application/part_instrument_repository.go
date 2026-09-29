package application

import (
	"github.com/oklog/ulid/v2"
)

type PartInstrumentRepository interface {
	Create(partID ulid.ULID, instrumentID ulid.ULID) error
	Delete(partID ulid.ULID, instrumentID ulid.ULID) error
}
