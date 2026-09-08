package application

import (
	"io"

	"github.com/oklog/ulid/v2"
)

type FileStorage interface {
	Save(fileID ulid.ULID, file io.Reader) error
	Load(fileID ulid.ULID) (io.ReadCloser, error)
	Delete(fileID ulid.ULID) error
}
