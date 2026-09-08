package filestorage

import (
	"io"
	"os"
	"path/filepath"

	"github.com/oklog/ulid/v2"
)

type LocalFileStorage struct {
	baseDir string
}

func NewLocalFileStorage(baseDir string) *LocalFileStorage {
	return &LocalFileStorage{
		baseDir: baseDir,
	}
}

// construct a local file path
// Note .pdf suffix added for convenient inspecting of uploaded files locally
func constructFilePath(baseDir string, fileID ulid.ULID) string {
	return filepath.Join(baseDir, fileID.String()+".pdf")
}

func (s *LocalFileStorage) Save(fileID ulid.ULID, file io.Reader) error {
	path := constructFilePath(s.baseDir, fileID)

	dst, err := os.Create(path)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	return err
}

func (s *LocalFileStorage) Load(fileID ulid.ULID) (io.ReadCloser, error) {
	path := constructFilePath(s.baseDir, fileID)

	return os.Open(path)
}

func (s *LocalFileStorage) Delete(fileID ulid.ULID) error {
	path := constructFilePath(s.baseDir, fileID)

	return os.Remove(path)
}
