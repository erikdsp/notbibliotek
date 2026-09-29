package application

import (
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type ConcertService struct {
	repository            ConcertRepository
	concertSongRepository ConcertSongRepository
}

func NewConcertService(
	repository ConcertRepository,
	concertSongRepository ConcertSongRepository,
) *ConcertService {
	return &ConcertService{
		repository:            repository,
		concertSongRepository: concertSongRepository,
	}
}

func (s *ConcertService) CreateConcert(key string, name string, date time.Time) (domain.Concert, error) {
	concert := domain.Concert{
		ID:   ulid.Make(),
		Key:  key,
		Name: name,
		Date: date,
	}

	if err := s.repository.Create(concert); err != nil {
		return domain.Concert{}, err
	}

	return concert, nil
}

func (s *ConcertService) GetAllConcerts() ([]domain.Concert, error) {
	return s.repository.GetAll()
}

func (s *ConcertService) GetConcertByID(id ulid.ULID) (domain.Concert, error) {
	return s.repository.GetByID(id)
}

func (s *ConcertService) UpdateConcert(id ulid.ULID, key *string, name *string, date *time.Time) (domain.Concert, error) {
	if key == nil && name == nil && date == nil {
		return domain.Concert{}, ErrNoFieldsToUpdate
	}

	concert, err := s.repository.GetByID(id)
	if err != nil {
		return domain.Concert{}, err
	}

	if key != nil {
		concert.Key = *key
	}

	if name != nil {
		concert.Name = *name
	}

	if date != nil {
		concert.Date = *date
	}

	if err := s.repository.Update(concert); err != nil {
		return domain.Concert{}, err
	}

	return concert, nil
}

func (s *ConcertService) DeleteConcert(id ulid.ULID) error {
	return s.repository.Delete(id)
}

func (s *ConcertService) CreateConnection(concertID ulid.ULID, songID ulid.ULID) error {
	return s.concertSongRepository.Create(concertID, songID)
}

func (s *ConcertService) DeleteConnection(concertID ulid.ULID, songID ulid.ULID) error {
	return s.concertSongRepository.Delete(concertID, songID)
}
