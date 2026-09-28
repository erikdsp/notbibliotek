package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type InstrumentService struct {
	repository               InstrumentRepository
	partInstrumentRepository PartInstrumentRepository
}

func NewInstrumentService(repository InstrumentRepository, partInstrumentRepository PartInstrumentRepository) *InstrumentService {
	return &InstrumentService{
		repository:               repository,
		partInstrumentRepository: partInstrumentRepository,
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

func (s *InstrumentService) CreateConnection(partID ulid.ULID, instrumentID ulid.ULID) (created bool, err error) {
	return s.partInstrumentRepository.Create(partID, instrumentID)
}

func (s *InstrumentService) DeleteConnection(partID ulid.ULID, instrumentID ulid.ULID) error {
	return s.partInstrumentRepository.Delete(partID, instrumentID)
}
