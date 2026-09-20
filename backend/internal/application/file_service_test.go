package application

import (
	"errors"
	"io"
	"testing"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

func Test_WhenGetFileByIDIsCalledWithValidIDThenFileWithCorrectNameAndContentIsReturned(t *testing.T) {

	fileID := ulid.Make()
	fileName := "File Name"

	f := newFileServiceFixture()
	f.repository.files = append(f.repository.files,
		domain.File{
			ID:   fileID,
			Name: fileName,
		})
	f.storage.file = "test file content"

	response, err := f.service.GetFileByID(fileID)
	if err != nil {
		t.Fatal(err)
	}
	defer response.File.Close()

	content, err := io.ReadAll(response.File)
	if err != nil {
		t.Fatal(err)
	}

	if response.FileName != fileName {
		t.Errorf("expected title %q, got %q", "File Name", response.FileName)
	}

	if len(f.repository.files) != 1 {
		t.Fatalf("expected repository to contain 1 file, got %d", len(f.repository.files))
	}

	if string(content) != f.storage.file {
		t.Errorf("expected file content %q, got %q", f.storage.file, string(content))
	}

}

func Test_WhenFileRepositoryReturnsErrorThenGetFileByIDReturnsError(t *testing.T) {

	repositoryError := errors.New("repository error")
	f := newFileServiceFixture()
	f.repository.err = repositoryError

	_, err := f.service.GetFileByID(ulid.Make())

	if !errors.Is(err, repositoryError) {
		t.Fatalf(
			"expected error %q, got %q",
			repositoryError,
			err,
		)
	}
}

func Test_WhenFileStorageReturnsErrorThenGetFileByIDReturnsError(t *testing.T) {

	fileID := ulid.Make()
	storageError := errors.New("storage error")
	f := newFileServiceFixture()

	f.repository.files = append(f.repository.files,
		domain.File{
			ID:   fileID,
			Name: "Test File",
		})
	f.storage.loadErr = storageError

	_, err := f.service.GetFileByID(fileID)

	if !errors.Is(err, storageError) {
		t.Fatalf(
			"expected error %q, got %q",
			storageError,
			err,
		)
	}
}

func Test_WhenFileDoesNotExistInRepositoryThenGetFileByIDReturnsErrFileNotFound(t *testing.T) {

	f := newFileServiceFixture()
	_, err := f.service.GetFileByID(ulid.Make())

	if !errors.Is(err, ErrFileNotFound) {
		t.Fatalf(
			"expected error %q, got %q",
			ErrFileNotFound,
			err,
		)
	}
}

// Test Setup

type fileServiceFixture struct {
	service    *FileService
	repository *mockFileRepository
	storage    *mockFileStorage
}

func newFileServiceFixture() fileServiceFixture {

	repository := &mockFileRepository{}
	storage := &mockFileStorage{}

	return fileServiceFixture{
		service: NewFileService(
			repository,
			storage,
		),
		repository: repository,
		storage:    storage,
	}
}
