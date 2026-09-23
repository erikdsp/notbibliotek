package drivefilestorage

import (
	"context"
	"io"
	"log"
	"os"

	"github.com/oklog/ulid/v2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

type DriveFileStorage struct {
	service    *drive.Service
	folderID   string
	repository DriveRepository
}

func NewDriveFileStorage(credentialsPath string, tokenPath string, folderID string, repository DriveRepository) (*DriveFileStorage, error) {
	ctx := context.Background()

	bytes, err := os.ReadFile(credentialsPath)
	if err != nil {
		return nil, err
	}

	config, err := google.ConfigFromJSON(
		bytes,
		drive.DriveFileScope,
	)
	if err != nil {
		return nil, err
	}

	client, err := getClient(config, tokenPath)
	if err != nil {
		return nil, err
	}

	service, err := drive.NewService(
		ctx,
		option.WithHTTPClient(client),
	)
	if err != nil {
		return nil, err
	}

	return &DriveFileStorage{
		service:    service,
		folderID:   folderID,
		repository: repository,
	}, nil
}

// construct a file name
func constructFileName(fileID ulid.ULID) string {
	return fileID.String() + ".pdf"
}

func (s *DriveFileStorage) Save(fileID ulid.ULID, file io.Reader) error {
	metadata := &drive.File{
		Name:     constructFileName(fileID),
		Parents:  []string{s.folderID},
		MimeType: "application/pdf",
	}

	driveFile, err := s.service.Files.
		Create(metadata).
		Media(file).
		Do()
	if err != nil {
		return err
	}

	if err := s.repository.SaveID(fileID, driveFile.Id); err != nil {
		s.fileStorageRollback(driveFile.Id)
		return err
	}

	return nil

}

func (s *DriveFileStorage) Load(fileID ulid.ULID) (io.ReadCloser, error) {
	driveFileID, err := s.repository.GetID(fileID)
	if err != nil {
		return nil, err
	}

	response, err := s.service.Files.
		Get(driveFileID).
		Download()
	if err != nil {
		return nil, err
	}

	return response.Body, nil
}

func (s *DriveFileStorage) Delete(fileID ulid.ULID) error {
	driveFileID, err := s.repository.GetID(fileID)
	if err != nil {
		return err
	}

	// Delete from Drive first to avoid losing the Drive file ID.
	// If deleting the repository mapping fails, a stale mapping may remain.
	if err := s.service.Files.Delete(driveFileID).Do(); err != nil {
		return err
	}

	if err := s.repository.DeleteID(fileID); err != nil {
		return err
	}

	return nil
}

func (s *DriveFileStorage) fileStorageRollback(driveFileId string) {
	if deleteErr := s.service.Files.Delete(driveFileId).Do(); deleteErr != nil {
		log.Printf(
			"failed to delete Drive file %s during rollback: %v",
			driveFileId,
			deleteErr,
		)
	}
}
