package application

import (
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type SongService struct {
	repository      SongRepository
	queryRepository SongQueryRepository
}

func NewSongService(repository SongRepository, queryRepository SongQueryRepository) *SongService {
	return &SongService{
		repository:      repository,
		queryRepository: queryRepository,
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

func (s *SongService) GetSongByID(id ulid.ULID, query SongByIDQuery) (SongDetails, error) {
	song, err := s.queryRepository.GetByID(id, query)
	if err != nil {
		return SongDetails{}, err
	}
	return song, nil
}

func (s *SongService) GetAllSongs(query SongQuery) ([]SongDetails, error) {
	return s.queryRepository.GetAll(query)
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
