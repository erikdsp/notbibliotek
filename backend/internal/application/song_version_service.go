package application

import (
	"io"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type SongVersionService struct {
	repository      SongVersionRepository
	songRepository  SongRepository
	fileRepository  FileRepository
	scoreRepository ScoreRepository
}

func NewSongVersionService(repository SongVersionRepository,
	songRepository SongRepository, fileRepository FileRepository,
	scoreRepository ScoreRepository) *SongVersionService {
	return &SongVersionService{
		repository:      repository,
		songRepository:  songRepository,
		fileRepository:  fileRepository,
		scoreRepository: scoreRepository,
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

// ScoreDetails
func (s *SongVersionService) UploadScore(songID ulid.ULID, versionID ulid.ULID,
	fileName string, file io.Reader) (domain.Score, error) {

	return domain.Score{}, nil
}
