package application

import (
	"errors"
	"testing"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

func Test_WhenCreateSucceedsThenCreateConcertReturnsCreatedConcert(t *testing.T) {

	f := newConcertServiceFixture()
	key := "fyrens"
	name := "Fyrens"
	date, _ := time.Parse(time.DateOnly, "2026-09-29")

	concert, err := f.service.CreateConcert(key, name, date)
	if err != nil {
		t.Fatal(err)
	}

	if concert.Key != key {
		t.Errorf("expected key %q, got %q", key, concert.Key)
	}

	if concert.Name != name {
		t.Errorf("expected name %q, got %q", name, concert.Name)
	}

	if !concert.Date.Equal(date) {
		t.Errorf("expected date %q, got %q", date, concert.Date)
	}

	if concert.ID == (ulid.ULID{}) {
		t.Error("expected concert ID to be generated")
	}

	if len(f.repository.concerts) != 1 {
		t.Fatalf("expected repository to contain 1 concert, got %d", len(f.repository.concerts))
	}

	repositoryConcert := f.repository.concerts[0]

	if repositoryConcert.Key != key {
		t.Errorf(
			"expected repository to receive title %q, got %q",
			key,
			repositoryConcert.Key,
		)
	}

	if repositoryConcert.Name != name {
		t.Errorf(
			"expected repository to receive title %q, got %q",
			name,
			repositoryConcert.Name,
		)
	}

	if !repositoryConcert.Date.Equal(date) {
		t.Errorf(
			"expected repository to receive date %q, got %q",
			date,
			repositoryConcert.Date,
		)
	}

	if repositoryConcert.ID != concert.ID {
		t.Error("expected repository to receive the same concert ID")
	}
}

func Test_WhenCreateFailsThenCreateConcertReturnsError(t *testing.T) {

	f := newConcertServiceFixture()
	expectedErr := errors.New("repository error")
	f.repository.createErr = expectedErr

	_, err := f.service.CreateConcert("key", "Name", time.Now())

	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func Test_WhenNameIsProvidedThenUpdateConcertUpdatesName(t *testing.T) {
	f := newConcertServiceFixture()
	id := ulid.Make()
	oldName := "Ullevi"
	newName := "Nya Ullevi"

	f.repository.concerts = append(f.repository.concerts, domain.Concert{
		ID:   id,
		Key:  "key",
		Name: oldName,
	})

	concert, err := f.service.UpdateConcert(id, nil, &newName, nil)
	if err != nil {
		t.Fatal(err)
	}

	if concert.Key != "key" {
		t.Errorf("expected key to be unchanged %q, got %q", "key", concert.Key)
	}

	if concert.Name != newName {
		t.Errorf("expected name %q, got %q", newName, concert.Name)
	}

}

func Test_WhenKeyIsProvidedThenUpdateConcertUpdatesKey(t *testing.T) {

	f := newConcertServiceFixture()
	id := ulid.Make()
	name := "Folkteatern"
	oldKey := "folkttr"
	newKey := "folkteatern"

	f.repository.concerts = append(f.repository.concerts, domain.Concert{
		ID:   id,
		Key:  oldKey,
		Name: name,
	})

	concert, err := f.service.UpdateConcert(id, &newKey, nil, nil)
	if err != nil {
		t.Fatal(err)
	}

	if concert.Key != newKey {
		t.Errorf("expected key to be %q, got %q", newKey, concert.Key)
	}

	if concert.Name != name {
		t.Errorf("expected name to be unchanged %q, got %q", name, concert.Name)
	}
}

func Test_WhenNameAndKeyAreProvidedThenUpdateConcertUpdatesBoth(t *testing.T) {

	f := newConcertServiceFixture()
	id := ulid.Make()
	oldName := "Ullevi"
	newName := "Nya Ullevi"
	oldKey := "ullevi"
	newKey := "nya-ullevi"

	f.repository.concerts = append(f.repository.concerts, domain.Concert{
		ID:   id,
		Key:  oldKey,
		Name: oldName,
	})

	concert, err := f.service.UpdateConcert(id, &newKey, &newName, nil)
	if err != nil {
		t.Fatal(err)
	}

	if concert.Key != newKey {
		t.Errorf("expected key to be %q, got %q", newKey, concert.Key)
	}

	if concert.Name != newName {
		t.Errorf("expected name to be %q, got %q", newName, concert.Name)
	}

}

func Test_WhenDateIsProvidedThenUpdateConcertUpdatesDate(t *testing.T) {

	f := newConcertServiceFixture()
	id := ulid.Make()
	name := "Oceanen"
	key := "oceanen"
	oldDate, _ := time.Parse(time.DateOnly, "2026-10-24")
	newDate, _ := time.Parse(time.DateOnly, "2026-10-25")

	f.repository.concerts = append(f.repository.concerts, domain.Concert{
		ID:   id,
		Key:  key,
		Name: name,
		Date: oldDate,
	})

	concert, err := f.service.UpdateConcert(id, nil, nil, &newDate)
	if err != nil {
		t.Fatal(err)
	}

	if concert.Key != key {
		t.Errorf("expected key to be unchanged %q, got %q", "key", concert.Key)
	}

	if concert.Name != name {
		t.Errorf("expected name to be unchanged %q, got %q", "name", concert.Name)
	}

	if !concert.Date.Equal(newDate) {
		t.Errorf("expected date to be %q, got %q", newDate, concert.Date)
	}

}

func Test_WhenNameAndKeyAreNilThenUpdateConcertReturnsError(t *testing.T) {

	f := newConcertServiceFixture()
	id := ulid.Make()

	f.repository.concerts = append(f.repository.concerts, domain.Concert{
		ID:   id,
		Key:  "key",
		Name: "Name",
	})

	_, err := f.service.UpdateConcert(id, nil, nil, nil)
	if err != ErrNoFieldsToUpdate {
		t.Fatalf("expected ErrNoFieldsToUpdate, got %v", err)
	}

}

func Test_WhenGetByIDFailsThenUpdateConcertReturnsError(t *testing.T) {

	f := newConcertServiceFixture()
	id := ulid.Make()
	newKey := "somekey"

	f.repository.concerts = append(f.repository.concerts, domain.Concert{
		ID:   id,
		Key:  "key",
		Name: "Name",
	})

	_, err := f.service.UpdateConcert(ulid.Make(), &newKey, nil, nil)
	if err != ErrConcertNotFound {
		t.Fatalf("expected ErrConcertNotFound, got %v", err)
	}

	if f.repository.updateCalled {
		t.Error("expected update() to not have been called")
	}

}

func Test_WhenUpdateFailsThenUpdateConcertReturnsError(t *testing.T) {

	f := newConcertServiceFixture()
	id := ulid.Make()
	date, _ := time.Parse(time.DateOnly, "2026-09-29")
	newKey := "somekey"
	expectedErr := errors.New("update error")
	f.repository.updateErr = expectedErr

	f.repository.concerts = append(f.repository.concerts, domain.Concert{
		ID:   id,
		Key:  "key",
		Name: "Name",
		Date: date,
	})

	_, err := f.service.UpdateConcert(id, &newKey, nil, nil)
	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

// test setup

type mockConcertRepository struct {
	concerts     []domain.Concert
	createErr    error
	getByIDErr   error
	updateErr    error
	getAllCalled bool
	updateCalled bool
}

func (m *mockConcertRepository) Create(concert domain.Concert) error {
	if m.createErr != nil {
		return m.createErr
	}
	m.concerts = append(m.concerts, concert)

	return nil
}

func (m *mockConcertRepository) GetByID(id ulid.ULID) (domain.Concert, error) {
	if m.getByIDErr != nil {
		return domain.Concert{}, m.getByIDErr
	}

	for _, concert := range m.concerts {
		if concert.ID == id {
			return concert, nil
		}
	}
	return domain.Concert{}, ErrConcertNotFound
}

func (m *mockConcertRepository) GetAll() ([]domain.Concert, error) {
	return []domain.Concert{}, nil
}

func (m *mockConcertRepository) Update(concert domain.Concert) error {
	m.updateCalled = true

	if m.updateErr != nil {
		return m.updateErr
	}

	for index, repoInstrument := range m.concerts {
		if repoInstrument.ID == concert.ID {
			m.concerts[index] = concert
		}
	}
	return nil
}

func (m *mockConcertRepository) Delete(id ulid.ULID) error {
	return nil
}

type mockConcertSongRepository struct {
}

func (m *mockConcertSongRepository) Create(concertID ulid.ULID, songID ulid.ULID) error {
	return nil
}

func (m *mockConcertSongRepository) Delete(concertID ulid.ULID, songID ulid.ULID) error {
	return nil
}

type concertServiceFixture struct {
	service               *ConcertService
	repository            *mockConcertRepository
	concertSongRepository *mockConcertSongRepository
}

func newConcertServiceFixture() concertServiceFixture {

	repository := &mockConcertRepository{}
	concertSongRepository := &mockConcertSongRepository{}

	return concertServiceFixture{
		service: NewConcertService(
			repository,
			concertSongRepository,
		),
		repository:            repository,
		concertSongRepository: concertSongRepository,
	}
}
