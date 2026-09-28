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

func (s *InstrumentService) CreateInstrument(name string, key string) (domain.Instrument, error) {
	instrument := domain.Instrument{
		ID:   ulid.Make(),
		Name: name,
		Key:  key,
	}

	if err := s.repository.Create(instrument); err != nil {
		return domain.Instrument{}, err
	}

	return instrument, nil
}

func (s *InstrumentService) GetAllInstruments() ([]domain.Instrument, error) {
	return s.repository.GetAll()
}

func (s *InstrumentService) UpdateInstrument(id ulid.ULID, name *string, key *string) (domain.Instrument, error) {
	if name == nil && key == nil {
		return domain.Instrument{}, ErrNoFieldsToUpdate
	}

	instrument, err := s.repository.GetByID(id)
	if err != nil {
		return domain.Instrument{}, err
	}

	if name != nil {
		instrument.Name = *name
	}

	if key != nil {
		instrument.Key = *key
	}

	if err := s.repository.Update(instrument); err != nil {
		return domain.Instrument{}, err
	}

	return instrument, nil
}

func (s *InstrumentService) DeleteInstrument(id ulid.ULID) error {
	return s.repository.Delete(id)
}
