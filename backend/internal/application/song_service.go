package application

import (
	"time"

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

func (s *SongService) GetAllSongsWithQuery(query SongQuery) ([]SongDetails, error) {
	return s.repository.GetAllWithDetails(query)
}

func (s *SongService) UpdateSong(id ulid.ULID, title *string, archived *bool) (domain.Song, error) {
	song, err := s.repository.GetByID(id)
	if err != nil {
		return domain.Song{}, err
	}

	if archived != nil {
		if *archived == true {
			now := time.Now()
			song.ArchivedAt = &now
		} else {
			song.ArchivedAt = nil
		}
	}

	if title != nil {
		song.Title = *title
	}

	if err := s.repository.Update(song); err != nil {
		return domain.Song{}, err
	}

	return song, nil
}
