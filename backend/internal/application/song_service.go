package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type SongService struct {
	repository SongRepository
}

func NewSongService(repository SongRepository) *SongService {
	return &SongService{
		repository: repository,
	}
}

func (s *SongService) CreateSong(title string) (domain.Song, error) {
	song := domain.Song{
		ID:    ulid.Make(),
		Title: title,
	}

	if err := s.repository.Create(song); err != nil {
		return domain.Song{}, err
	}

	return song, nil
}

func (s *SongService) GetSongByID(id ulid.ULID) (domain.Song, error) {
	return s.repository.GetByID(id)
}

func (s *SongService) GetAllSongs() ([]domain.Song, error) {
	return s.repository.GetAll()
}
