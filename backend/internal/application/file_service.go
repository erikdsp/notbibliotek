package application

import (
	"io"

	"github.com/oklog/ulid/v2"
)

type FileService struct {
	repository FileRepository
	storage    FileStorage
}

type FileResponse struct {
	FileName string
	File     io.ReadCloser
}

func NewFileService(repository FileRepository, storage FileStorage) *FileService {
	return &FileService{
		repository: repository,
		storage:    storage,
	}
}

func (s *FileService) GetFileByID(id ulid.ULID) (FileResponse, error) {
	domainFile, err := s.repository.GetByID(id)
	if err != nil {
		return FileResponse{}, err
	}

	file, err := s.storage.Load(id)
	if err != nil {
		return FileResponse{}, err
	}

	return FileResponse{
		FileName: domainFile.Name,
		File:     file,
	}, nil
}
