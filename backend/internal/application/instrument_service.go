package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type InstrumentService struct {
	repository InstrumentRepository
}

func NewInstrumentService(repository InstrumentRepository) *InstrumentService {
	return &InstrumentService{
		repository: repository,
	}
}

func (s *InstrumentService) CreateInstrument(key string, name string) (domain.Instrument, error) {
	instrument := domain.Instrument{
		ID:   ulid.Make(),
		Key:  key,
		Name: name,
	}

	if err := s.repository.Create(instrument); err != nil {
		return domain.Instrument{}, err
	}

	return instrument, nil
}

func (s *InstrumentService) GetAllInstruments() ([]domain.Instrument, error) {
	return s.repository.GetAll()
}

func (s *InstrumentService) UpdateInstrument(id ulid.ULID, key *string, name *string) (domain.Instrument, error) {
	if key == nil && name == nil {
		return domain.Instrument{}, ErrNoFieldsToUpdate
	}

	instrument, err := s.repository.GetByID(id)
	if err != nil {
		return domain.Instrument{}, err
	}

	if key != nil {
		instrument.Key = *key
	}

	if name != nil {
		instrument.Name = *name
	}

	if err := s.repository.Update(instrument); err != nil {
		return domain.Instrument{}, err
	}

	return instrument, nil
}

func (s *InstrumentService) DeleteInstrument(id ulid.ULID) error {
	return s.repository.Delete(id)
}
