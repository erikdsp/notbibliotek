package filestorage

import (
	"io"
	"os"
	"strings"
	"testing"

	"github.com/oklog/ulid/v2"
)

func Test_WhenSaveIsCalledThenLocalFileStorageSavesACopyOfTheFile(t *testing.T) {
	baseDir := t.TempDir()

	storage := NewLocalFileStorage(baseDir)

	fileID := ulid.Make()
	reader := strings.NewReader("test content")

	err := storage.Save(fileID, reader)
	if err != nil {
		t.Fatal(err)
	}

	path := constructFilePath(baseDir, fileID)

	content, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}

	if string(content) != "test content" {
		t.Fatalf("unexpected file content: %q", content)
	}
}

func TestWhenLoadIsCalledWithValidFileIDThenLocalFileStorageReturnsCorrectContent(t *testing.T) {
	baseDir := t.TempDir()

	storage := NewLocalFileStorage(baseDir)

	fileID := ulid.Make()
	reader := strings.NewReader("test content")

	err := storage.Save(fileID, reader)
	if err != nil {
		t.Fatal(err)
	}

	rc, err := storage.Load(fileID)
	if err != nil {
		t.Fatal(err)
	}
	defer rc.Close()

	content, err := io.ReadAll(rc)
	if err != nil {
		t.Fatal(err)
	}

	if string(content) != "test content" {
		t.Fatalf("unexpected file content: %q", content)
	}
}

func Test_WhenDeletIsCalledWithExistingFileIDThenLocalFileStorageDeletesTheFile(t *testing.T) {
	baseDir := t.TempDir()
	storage := NewLocalFileStorage(baseDir)

	fileID := ulid.Make()

	err := storage.Save(fileID, strings.NewReader("test content"))
	if err != nil {
		t.Fatal(err)
	}

	err = storage.Delete(fileID)
	if err != nil {
		t.Fatal(err)
	}

	rc, err := storage.Load(fileID)
	if err == nil {
		rc.Close()
		t.Fatal("expected Load to fail after Delete")
	}
}
