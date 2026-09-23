package drivefilestorage

import (
	"github.com/oklog/ulid/v2"
)

type DriveRepository interface {
	SaveID(fileID ulid.ULID, driveFileID string) error
	GetID(fileID ulid.ULID) (string, error)
	DeleteID(fileID ulid.ULID) error
}
