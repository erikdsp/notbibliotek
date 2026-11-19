package application

type FileZipper interface {
	GetFilesAsZip(
		request ZipRequest,
	) (DownloadableFile, []FileDownloadError, error)
}
