package application

import (
	"io"
	"log"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type SongVersionService struct {
	repository      SongVersionRepository
	songRepository  SongRepository
	fileRepository  FileRepository
	scoreRepository ScoreRepository
	partRepository  PartRepository
	fileStorage     FileStorage
}

func NewSongVersionService(repository SongVersionRepository,
	songRepository SongRepository, fileRepository FileRepository,
	scoreRepository ScoreRepository, partRepository PartRepository,
	fileStorage FileStorage) *SongVersionService {
	return &SongVersionService{
		repository:      repository,
		songRepository:  songRepository,
		fileRepository:  fileRepository,
		scoreRepository: scoreRepository,
		partRepository:  partRepository,
		fileStorage:     fileStorage,
	}
}

func (s *SongVersionService) CreateSongVersion(songID ulid.ULID) (domain.SongVersion, error) {
	_, err := s.songRepository.GetByID(songID)
	if err != nil {
		return domain.SongVersion{}, err
	}

	songVersion := domain.SongVersion{
		ID:          ulid.Make(),
		SongID:      songID,
		PublishedAt: nil,
	}

	if err := s.repository.Create(songVersion); err != nil {
		return domain.SongVersion{}, err
	}

	return songVersion, nil
}

func (s *SongVersionService) UploadScore(songID ulid.ULID, versionID ulid.ULID,
	fileName string, file io.Reader) (domain.Score, error) {

	version, err := s.repository.GetByID(versionID)
	if err != nil {
		return domain.Score{}, err
	}
	if version.SongID != songID {
		return domain.Score{}, ErrInvalidSongID
	}
	if version.PublishedAt != nil {
		return domain.Score{}, ErrInvalidOperation
	}

	_, err = s.scoreRepository.GetBySongVersionID(versionID)
	if err == nil {
		return domain.Score{}, ErrConflictingOperation
	}

	fileID := ulid.Make()

	err = s.fileStorage.Save(fileID, file)
	if err != nil {
		return domain.Score{}, err
	}

	err = s.fileRepository.Create(domain.File{ID: fileID, Name: fileName})

	if err != nil {
		s.fileStorageRollback(fileID)
		return domain.Score{}, err
	}

	score := domain.Score{
		ID:            ulid.Make(),
		SongVersionID: versionID,
		FileID:        fileID,
	}

	err = s.scoreRepository.Create(score)

	if err != nil {
		s.fileRepositoryRollback(fileID)
		s.fileStorageRollback(fileID)
		return domain.Score{}, err
	}

	return score, nil

}

func (s *SongVersionService) UpdateScore(songID ulid.ULID, versionID ulid.ULID,
	fileName string, file io.Reader) (domain.Score, error) {

	version, err := s.repository.GetByID(versionID)
	if err != nil {
		return domain.Score{}, err
	}
	if version.SongID != songID {
		return domain.Score{}, ErrInvalidSongID
	}
	if version.PublishedAt != nil {
		return domain.Score{}, ErrInvalidOperation
	}

	score, err := s.scoreRepository.GetBySongVersionID(versionID)
	if err != nil {
		return domain.Score{}, err
	}

	fileID := ulid.Make()
	oldFileID := score.FileID
	score.FileID = fileID

	err = s.fileStorage.Save(fileID, file)
	if err != nil {
		return domain.Score{}, err
	}

	err = s.fileRepository.Create(domain.File{ID: fileID, Name: fileName})

	if err != nil {
		s.fileStorageRollback(fileID)
		return domain.Score{}, err
	}

	err = s.scoreRepository.Update(score)
	if err != nil {
		s.fileRepositoryRollback(fileID)
		s.fileStorageRollback(fileID)
		return domain.Score{}, err
	}

	s.cleanupOldFile(oldFileID)

	return score, nil

}

func (s *SongVersionService) UploadPart(songID ulid.ULID, versionID ulid.ULID,
	key string, partName string, fileName string, file io.Reader) (domain.Part, error) {

	version, err := s.repository.GetByID(versionID)
	if err != nil {
		return domain.Part{}, err
	}
	if version.SongID != songID {
		return domain.Part{}, ErrInvalidSongID
	}
	if version.PublishedAt != nil {
		return domain.Part{}, ErrInvalidOperation
	}

	_, err = s.partRepository.GetBySongVersionIDAndKey(versionID, key)
	if err == nil {
		return domain.Part{}, ErrConflictingOperation
	}

	fileID := ulid.Make()

	err = s.fileStorage.Save(fileID, file)
	if err != nil {
		return domain.Part{}, err
	}

	err = s.fileRepository.Create(domain.File{ID: fileID, Name: fileName})

	if err != nil {
		s.fileStorageRollback(fileID)
		return domain.Part{}, err
	}

	part := domain.Part{
		ID:            ulid.Make(),
		Key:           key,
		Name:          partName,
		SongVersionID: versionID,
		FileID:        fileID,
	}

	err = s.partRepository.Create(part)

	if err != nil {
		s.fileRepositoryRollback(fileID)
		s.fileStorageRollback(fileID)
		return domain.Part{}, err
	}

	return part, nil

}

func (s *SongVersionService) UpdatePart(songID ulid.ULID, versionID ulid.ULID,
	key string, partName string, fileName string, file io.Reader) (domain.Part, error) {

	version, err := s.repository.GetByID(versionID)
	if err != nil {
		return domain.Part{}, err
	}
	if version.SongID != songID {
		return domain.Part{}, ErrInvalidSongID
	}
	if version.PublishedAt != nil {
		return domain.Part{}, ErrInvalidOperation
	}

	part, err := s.partRepository.GetBySongVersionIDAndKey(versionID, key)
	if err != nil {
		return domain.Part{}, err
	}

	fileID := ulid.Make()
	oldFileID := part.FileID
	part.FileID = fileID

	err = s.fileStorage.Save(fileID, file)
	if err != nil {
		return domain.Part{}, err
	}

	err = s.fileRepository.Create(domain.File{ID: fileID, Name: fileName})

	if err != nil {
		s.fileStorageRollback(fileID)
		return domain.Part{}, err
	}

	err = s.partRepository.Update(part)
	if err != nil {
		s.fileRepositoryRollback(fileID)
		s.fileStorageRollback(fileID)
		return domain.Part{}, err
	}

	s.cleanupOldFile(oldFileID)

	return part, nil

}

func (s *SongVersionService) fileStorageRollback(fileID ulid.ULID) {
	if deleteErr := s.fileStorage.Delete(fileID); deleteErr != nil {
		log.Printf("failed to delete file %s: %v during rollback", fileID, deleteErr)
	}
}

func (s *SongVersionService) fileRepositoryRollback(fileID ulid.ULID) {
	if deleteErr := s.fileRepository.Delete(fileID); deleteErr != nil {
		log.Printf("failed to delete file metadata %s: %v during rollback", fileID, deleteErr)
	}
}

func (s *SongVersionService) cleanupOldFile(fileID ulid.ULID) {
	if err := s.fileRepository.Delete(fileID); err != nil {
		log.Printf("failed to delete old file metadata %s: %v", fileID, err)
	}

	if err := s.fileStorage.Delete(fileID); err != nil {
		log.Printf("failed to delete old file %s: %v", fileID, err)
	}
}
