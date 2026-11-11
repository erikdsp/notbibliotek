package application

import (
	"github.com/oklog/ulid/v2"
)

type FileZipper interface {
	GetFilesAsZip(
		ids []ulid.ULID,
		outputFileName string,
	) (DownloadableFile, []FileDownloadError, error)
}
