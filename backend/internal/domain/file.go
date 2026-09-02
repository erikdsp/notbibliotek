package domain

import (
	"github.com/oklog/ulid/v2"
)

type File struct {
	ID       ulid.ULID
	FileName string
}
