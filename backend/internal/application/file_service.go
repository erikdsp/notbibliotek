package application

import (
	"archive/zip"
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"strings"

	"github.com/erikdsp/notbibliotek/backend/internal/utils/set"

	"github.com/oklog/ulid/v2"
)

type FileService struct {
	repository FileRepository
	storage    FileStorage
}

type DownloadableFile struct {
	FileName string
	File     io.ReadCloser
}

type FileDownloadError struct {
	FileID ulid.ULID
	Err    error
}

const maxPDFFileSize = 20 << 20 // 20 MiB per PDF

func NewFileService(repository FileRepository, storage FileStorage) *FileService {
	return &FileService{
		repository: repository,
		storage:    storage,
	}
}

func (s *FileService) GetFileByID(id ulid.ULID) (DownloadableFile, error) {
	domainFile, err := s.repository.GetByID(id)
	if err != nil {
		return DownloadableFile{}, err
	}

	file, err := s.storage.Load(id)
	if err != nil {
		return DownloadableFile{}, err
	}

	return DownloadableFile{
		FileName: domainFile.Name,
		File:     file,
	}, nil
}

func (s *FileService) GetFilesAsZip(ids []ulid.ULID, outputFileName string) (DownloadableFile, []FileDownloadError, error) {
	tempFile, err := newTemporaryFile("", "download-*.zip")
	if err != nil {
		return DownloadableFile{}, nil, err
	}

	fileOwnershipTransferred := false
	defer func() {
		if !fileOwnershipTransferred {
			tempFile.Close()
		}
	}()

	zipWriter := zip.NewWriter(tempFile)

	usedFileNames := set.NewSet[string]()
	var fileDownloadErrors []FileDownloadError

	for _, fileID := range ids {
		originalFileName, data, err := s.readFile(fileID)
		if err != nil {
			fileDownloadErrors = append(fileDownloadErrors, FileDownloadError{
				FileID: fileID,
				Err:    err,
			})
			continue
		}

		uniqueFileName := getUniqueFileName(originalFileName, usedFileNames)

		if err := addFileToZip(zipWriter, uniqueFileName, data); err != nil {
			return DownloadableFile{}, fileDownloadErrors, err
		}

		usedFileNames.Insert(uniqueFileName)
	}

	if usedFileNames.Len() == 0 {
		return DownloadableFile{}, fileDownloadErrors, ErrNoFilesAvailable
	}

	if err := zipWriter.Close(); err != nil {
		return DownloadableFile{}, fileDownloadErrors, err
	}

	if _, err := tempFile.Seek(0, io.SeekStart); err != nil {
		return DownloadableFile{}, fileDownloadErrors, err
	}

	fileOwnershipTransferred = true

	return DownloadableFile{
		FileName: outputFileName,
		File:     tempFile,
	}, fileDownloadErrors, nil
}

type temporaryFile struct {
	*os.File
}

func (f *temporaryFile) Close() error {
	return errors.Join(
		f.File.Close(),
		os.Remove(f.Name()),
	)
}

func newTemporaryFile(dir string, pattern string) (*temporaryFile, error) {
	file, err := os.CreateTemp(dir, pattern)
	if err != nil {
		return nil, err
	}

	return &temporaryFile{File: file}, nil
}

func (s *FileService) readFile(id ulid.ULID) (fileName string, data []byte, err error) {
	response, err := s.GetFileByID(id)
	if err != nil {
		return "", nil, err
	}

	data, readErr := io.ReadAll(
		io.LimitReader(response.File, maxPDFFileSize+1),
	)
	closeErr := response.File.Close()

	if err := errors.Join(readErr, closeErr); err != nil {
		return "", nil, err
	}

	if len(data) > maxPDFFileSize {
		return "", nil, fmt.Errorf("file %s exceeds size limit", id)
	}

	return response.FileName, data, nil
}

func getUniqueFileName(fileName string, usedFileNames set.Set[string]) string {
	baseFileName := removeDirectoryPath(fileName)

	extension := path.Ext(baseFileName)
	baseName := strings.TrimSuffix(baseFileName, extension)

	uniqueFileName := baseFileName
	suffix := 2

	for usedFileNames.Contains(uniqueFileName) {
		uniqueFileName = fmt.Sprintf("%s (%d)%s", baseName, suffix, extension)
		suffix++
	}

	return uniqueFileName
}

func removeDirectoryPath(fileName string) string {
	return path.Base(strings.ReplaceAll(fileName, "\\", "/"))
}

func addFileToZip(
	zipWriter *zip.Writer,
	fileName string,
	data []byte,
) error {
	entry, err := zipWriter.Create(fileName)
	if err != nil {
		return err
	}

	_, err = entry.Write(data)
	return err
}
