package application

import (
	"archive/zip"
	"bytes"
	"errors"
	"io"
	"os"
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

func Test_WhenAllFilesAreAvailableThenGetFilesAsZipReturnsZipContainingAllFiles(t *testing.T) {
	f := newFileServiceFixture()

	firstFileID := ulid.Make()
	secondFileID := ulid.Make()

	expectedFiles := map[string]string{
		"Violin 1.pdf": "Violin PDF content",
		"Cello.pdf":    "Cello PDF content",
	}

	f.repository.files = []domain.File{
		{ID: firstFileID, Name: "Violin 1.pdf"},
		{ID: secondFileID, Name: "Cello.pdf"},
	}

	f.storage.files = map[ulid.ULID]string{
		firstFileID:  expectedFiles["Violin 1.pdf"],
		secondFileID: expectedFiles["Cello.pdf"],
	}

	response, downloadErrors, err := f.service.GetFilesAsZip(
		[]ulid.ULID{firstFileID, secondFileID},
		"test-download.zip",
	)
	if err != nil {
		t.Fatalf("GetFilesAsZip returned unexpected error: %v", err)
	}
	defer response.File.Close()

	if len(downloadErrors) != 0 {
		t.Errorf("Expected no download errors, got %v", downloadErrors)
	}

	if response.FileName != "test-download.zip" {
		t.Errorf("Expected filename test-download.zip, got %s", response.FileName)
	}

	assertZipContainsFiles(t, response.File, expectedFiles)

}

func Test_WhenSomeFilesAreUnavailableThenGetFilesAsZipReturnsPartialZipAndDownloadErrors(t *testing.T) {
	fixture := newFileServiceFixture()

	firstFileID := ulid.Make()
	missingFileID := ulid.Make()
	thirdFileID := ulid.Make()

	expectedFiles := map[string]string{
		"Violin 1.pdf": "Violin PDF content",
		"Cello.pdf":    "Cello PDF content",
	}

	fixture.repository.files = []domain.File{
		{ID: firstFileID, Name: "Violin 1.pdf"},
		{ID: thirdFileID, Name: "Cello.pdf"},
	}

	fixture.storage.files = map[ulid.ULID]string{
		firstFileID: expectedFiles["Violin 1.pdf"],
		thirdFileID: expectedFiles["Cello.pdf"],
	}

	response, downloadErrors, err := fixture.service.GetFilesAsZip(
		[]ulid.ULID{firstFileID, missingFileID, thirdFileID},
		"test-download.zip",
	)
	if err != nil {
		t.Fatalf("GetFilesAsZip returned unexpected error: %v", err)
	}
	defer response.File.Close()

	if len(downloadErrors) != 1 {
		t.Fatalf("Expected 1 download error, got %d", len(downloadErrors))
	}

	if downloadErrors[0].FileID != missingFileID {
		t.Errorf(
			"Expected download error for file %s, got %s",
			missingFileID,
			downloadErrors[0].FileID,
		)
	}

	if !errors.Is(downloadErrors[0].Err, ErrFileNotFound) {
		t.Errorf(
			"Expected ErrFileNotFound, got %v",
			downloadErrors[0].Err,
		)
	}

	assertZipContainsFiles(t, response.File, expectedFiles)

}

func Test_WhenNoFilesAreAvailableThenGetFilesAsZipReturnsErrNoFilesAvailable(t *testing.T) {
	fixture := newFileServiceFixture()

	firstFileID := ulid.Make()
	secondFileID := ulid.Make()

	response, downloadErrors, err := fixture.service.GetFilesAsZip(
		[]ulid.ULID{firstFileID, secondFileID},
		"test-download.zip",
	)

	if !errors.Is(err, ErrNoFilesAvailable) {
		t.Fatalf("Expected ErrNoFilesAvailable, got %v", err)
	}

	if len(downloadErrors) != 2 {
		t.Fatalf("Expected 2 download errors, got %d", len(downloadErrors))
	}

	for index, expectedFileID := range []ulid.ULID{firstFileID, secondFileID} {
		if downloadErrors[index].FileID != expectedFileID {
			t.Errorf(
				"Expected download error for file %s, got %s",
				expectedFileID,
				downloadErrors[index].FileID,
			)
		}

		if !errors.Is(downloadErrors[index].Err, ErrFileNotFound) {
			t.Errorf(
				"Expected ErrFileNotFound, got %v",
				downloadErrors[index].Err,
			)
		}
	}

	if response.File != nil {
		response.File.Close()
		t.Error("Expected no downloadable file")
	}
}

func Test_WhenFilesHaveDuplicateNamesThenGetFilesAsZipUsesUniqueFileNames(t *testing.T) {
	fixture := newFileServiceFixture()

	firstFileID := ulid.Make()
	secondFileID := ulid.Make()

	fixture.repository.files = []domain.File{
		{ID: firstFileID, Name: "Violin 1.pdf"},
		{ID: secondFileID, Name: "Violin 1.pdf"},
	}

	fixture.storage.files = map[ulid.ULID]string{
		firstFileID:  "First violin PDF content",
		secondFileID: "Second violin PDF content",
	}

	response, downloadErrors, err := fixture.service.GetFilesAsZip(
		[]ulid.ULID{firstFileID, secondFileID},
		"test-download.zip",
	)
	if err != nil {
		t.Fatalf("GetFilesAsZip returned unexpected error: %v", err)
	}
	defer response.File.Close()

	if len(downloadErrors) != 0 {
		t.Errorf("Expected no download errors, got %v", downloadErrors)
	}

	expectedFiles := map[string]string{
		"Violin 1.pdf":     "First violin PDF content",
		"Violin 1 (2).pdf": "Second violin PDF content",
	}

	assertZipContainsFiles(t, response.File, expectedFiles)
}

func Test_WhenDownloadableFileIsClosedThenTemporaryZipFileIsRemoved(t *testing.T) {
	fixture := newFileServiceFixture()

	fileID := ulid.Make()

	fixture.repository.files = []domain.File{
		{ID: fileID, Name: "Violin 1.pdf"},
	}
	fixture.storage.file = "Violin PDF content"

	response, _, err := fixture.service.GetFilesAsZip(
		[]ulid.ULID{fileID},
		"test-download.zip",
	)
	if err != nil {
		t.Fatalf("GetFilesAsZip returned unexpected error: %v", err)
	}
	fileClosed := false
	t.Cleanup(func() {
		if !fileClosed {
			response.File.Close()
		}
	})

	tempFile, ok := response.File.(*temporaryFile)
	if !ok {
		t.Fatalf("Expected *temporaryFile, got %T", response.File)
	}

	tempFilePath := tempFile.Name()

	if _, err := os.Stat(tempFilePath); err != nil {
		t.Fatalf("Expected temporary ZIP file to exist before Close: %v", err)
	}

	closeErr := response.File.Close()
	fileClosed = true

	if closeErr != nil {
		t.Fatalf("Failed to close downloadable file: %v", closeErr)
	}

	if _, err := os.Stat(tempFilePath); !errors.Is(err, os.ErrNotExist) {
		t.Errorf("Expected temporary ZIP file to be removed, got %v", err)
	}
}

// test helpers

func assertZipContainsFiles(
	t *testing.T,
	file io.Reader,
	expectedFiles map[string]string,
) {
	t.Helper()

	zipData, err := io.ReadAll(file)
	if err != nil {
		t.Fatalf("Failed to read ZIP data: %v", err)
	}

	zipReader, err := zip.NewReader(bytes.NewReader(zipData), int64(len(zipData)))
	if err != nil {
		t.Fatalf("Failed to open ZIP archive: %v", err)
	}

	if len(zipReader.File) != len(expectedFiles) {
		t.Fatalf(
			"Expected %d files in ZIP, got %d",
			len(expectedFiles),
			len(zipReader.File),
		)
	}

	for _, zipFile := range zipReader.File {
		expectedContent, exists := expectedFiles[zipFile.Name]
		if !exists {
			t.Errorf("Unexpected file in ZIP: %s", zipFile.Name)
			continue
		}

		fileReader, err := zipFile.Open()
		if err != nil {
			t.Fatalf("Failed to open ZIP entry %s: %v", zipFile.Name, err)
		}

		actualContent, readErr := io.ReadAll(fileReader)
		closeErr := fileReader.Close()

		if err := errors.Join(readErr, closeErr); err != nil {
			t.Fatalf("Failed to read ZIP entry %s: %v", zipFile.Name, err)
		}

		if string(actualContent) != expectedContent {
			t.Errorf(
				"Incorrect content for %s: expected %q, got %q",
				zipFile.Name,
				expectedContent,
				string(actualContent),
			)
		}
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
