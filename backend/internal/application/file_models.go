package application

import (
	"io"

	"github.com/oklog/ulid/v2"
)

type DownloadableFile struct {
	FileName string
	File     io.ReadCloser
}

type FileDownloadError struct {
	FileID ulid.ULID
	Err    error
}

type ZipEntry struct {
	FileName string
	Data     []byte
}

type ZipRequest struct {
	OutputFileName string
	FileIDs        []ulid.ULID
	Files          []ZipEntry
}
