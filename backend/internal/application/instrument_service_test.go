package application

import (
	"errors"
	"testing"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

func Test_WhenCreateSucceedsThenCreateInstrumentReturnsCreatedInstrument(t *testing.T) {

	f := newInstrumentServiceFixture()
	name := "Oud"
	key := "oud"

	instrument, err := f.service.CreateInstrument(name, key)
	if err != nil {
		t.Fatal(err)
	}

	if instrument.Name != name {
		t.Errorf("expected name %q, got %q", name, instrument.Name)
	}

	if instrument.Key != key {
		t.Errorf("expected key %q, got %q", key, instrument.Key)
	}

	if instrument.ID == (ulid.ULID{}) {
		t.Error("expected instrument ID to be generated")
	}

	if len(f.repository.instruments) != 1 {
		t.Fatalf("expected repository to contain 1 instrument, got %d", len(f.repository.instruments))
	}

	repositoryInstrument := f.repository.instruments[0]

	if repositoryInstrument.Name != name {
		t.Errorf(
			"expected repository to receive title %q, got %q",
			name,
			repositoryInstrument.Name,
		)
	}

	if repositoryInstrument.Key != key {
		t.Errorf(
			"expected repository to receive title %q, got %q",
			key,
			repositoryInstrument.Key,
		)
	}

	if repositoryInstrument.ID != instrument.ID {
		t.Error("expected repository to receive the same instrument ID")
	}
}

func Test_WhenCreateFailsThenCreateInstrumentReturnsError(t *testing.T) {

	f := newInstrumentServiceFixture()
	expectedErr := errors.New("repository error")
	f.repository.createErr = expectedErr

	_, err := f.service.CreateInstrument("Name", "key")

	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func Test_WhenNameIsProvidedThenUpdateInstrumentUpdatesName(t *testing.T) {
	f := newInstrumentServiceFixture()
	id := ulid.Make()
	oldName := "Sackbut"
	newName := "Posaune"

	f.repository.instruments = append(f.repository.instruments, domain.Instrument{
		ID:   id,
		Name: oldName,
		Key:  "key",
	})

	instrument, err := f.service.UpdateInstrument(id, &newName, nil)
	if err != nil {
		t.Fatal(err)
	}

	if instrument.Name != newName {
		t.Errorf("expected name %q, got %q", newName, instrument.Name)
	}

	if instrument.Key != "key" {
		t.Errorf("expected key to be unchanged %q, got %q", "key", instrument.Key)
	}

}

func Test_WhenKeyIsProvidedThenUpdateInstrumentUpdatesKey(t *testing.T) {

	f := newInstrumentServiceFixture()
	id := ulid.Make()
	name := "Trombone"
	oldKey := "sackbut"
	newKey := "posaune"

	f.repository.instruments = append(f.repository.instruments, domain.Instrument{
		ID:   id,
		Name: name,
		Key:  oldKey,
	})

	instrument, err := f.service.UpdateInstrument(id, nil, &newKey)
	if err != nil {
		t.Fatal(err)
	}

	if instrument.Name != name {
		t.Errorf("expected name to be unchanged %q, got %q", name, instrument.Name)
	}

	if instrument.Key != newKey {
		t.Errorf("expected key to be %q, got %q", newKey, instrument.Key)
	}

}

func Test_WhenNameAndKeyAreProvidedThenUpdateInstrumentUpdatesBoth(t *testing.T) {

	f := newInstrumentServiceFixture()
	id := ulid.Make()
	oldName := "Sackbut"
	newName := "Posaune"
	oldKey := "sackbut"
	newKey := "posaune"

	f.repository.instruments = append(f.repository.instruments, domain.Instrument{
		ID:   id,
		Name: oldName,
		Key:  oldKey,
	})

	instrument, err := f.service.UpdateInstrument(id, &newName, &newKey)
	if err != nil {
		t.Fatal(err)
	}

	if instrument.Name != newName {
		t.Errorf("expected name to be %q, got %q", newName, instrument.Name)
	}

	if instrument.Key != newKey {
		t.Errorf("expected key to be %q, got %q", newKey, instrument.Key)
	}

}

func Test_WhenNameAndKeyAreNilThenUpdateInstrumentReturnsError(t *testing.T) {

	f := newInstrumentServiceFixture()
	id := ulid.Make()

	f.repository.instruments = append(f.repository.instruments, domain.Instrument{
		ID:   id,
		Name: "Name",
		Key:  "key",
	})

	_, err := f.service.UpdateInstrument(id, nil, nil)
	if err != ErrNoFieldsToUpdate {
		t.Fatalf("expected ErrNoFieldsToUpdate, got %v", err)
	}

}

func Test_WhenGetByIDFailsThenUpdateInstrumentReturnsError(t *testing.T) {

	f := newInstrumentServiceFixture()
	id := ulid.Make()
	newKey := "somekey"

	f.repository.instruments = append(f.repository.instruments, domain.Instrument{
		ID:   id,
		Name: "Name",
		Key:  "key",
	})

	_, err := f.service.UpdateInstrument(ulid.Make(), nil, &newKey)
	if err != ErrInstrumentNotFound {
		t.Fatalf("expected ErrInstrumentNotFound, got %v", err)
	}

	if f.repository.updateCalled {
		t.Error("expected update() to not have been called")
	}

}

func Test_WhenUpdateFailsThenUpdateInstrumentReturnsError(t *testing.T) {

	f := newInstrumentServiceFixture()
	id := ulid.Make()
	newKey := "somekey"
	expectedErr := errors.New("update error")
	f.repository.updateErr = expectedErr

	f.repository.instruments = append(f.repository.instruments, domain.Instrument{
		ID:   id,
		Name: "Name",
		Key:  "key",
	})

	_, err := f.service.UpdateInstrument(id, nil, &newKey)
	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

// test setup

type mockInstrumentRepository struct {
	instruments  []domain.Instrument
	createErr    error
	getByIDErr   error
	updateErr    error
	getAllCalled bool
	updateCalled bool
}

func (m *mockInstrumentRepository) Create(instrument domain.Instrument) error {
	if m.createErr != nil {
		return m.createErr
	}
	m.instruments = append(m.instruments, instrument)

	return nil
}

func (m *mockInstrumentRepository) GetByID(id ulid.ULID) (domain.Instrument, error) {
	if m.getByIDErr != nil {
		return domain.Instrument{}, m.getByIDErr
	}

	for _, instrument := range m.instruments {
		if instrument.ID == id {
			return instrument, nil
		}
	}
	return domain.Instrument{}, ErrInstrumentNotFound
}

func (m *mockInstrumentRepository) GetAll() ([]domain.Instrument, error) {
	return []domain.Instrument{}, nil
}

func (m *mockInstrumentRepository) Update(file domain.Instrument) error {
	m.updateCalled = true

	if m.updateErr != nil {
		return m.updateErr
	}

	for index, instrument := range m.instruments {
		if instrument.ID == file.ID {
			m.instruments[index] = file
		}
	}
	return nil
}

func (m *mockInstrumentRepository) Delete(id ulid.ULID) error {
	return nil
}

type instrumentServiceFixture struct {
	service    *InstrumentService
	repository *mockInstrumentRepository
}

func newInstrumentServiceFixture() instrumentServiceFixture {

	repository := &mockInstrumentRepository{}

	return instrumentServiceFixture{
		service: NewInstrumentService(
			repository,
		),
		repository: repository,
	}
}
