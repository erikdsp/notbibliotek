package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type SongVersionService struct {
	repository     SongVersionRepository
	songRepository SongRepository
}

func NewSongVersionService(repository SongVersionRepository, songRepository SongRepository) *SongVersionService {
	return &SongVersionService{
		repository:     repository,
		songRepository: songRepository,
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
