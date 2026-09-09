package application

import (
	"errors"
	"testing"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/oklog/ulid/v2"
)

type mockSongRepository struct {
	songs        []domain.Song
	err          error
	archivedArg  bool
	getAllCalled bool
}

func (m *mockSongRepository) Create(song domain.Song) error {
	m.songs = append(m.songs, song)
	return m.err
}

func (m *mockSongRepository) GetByID(id ulid.ULID) (domain.Song, error) {
	for _, song := range m.songs {
		if song.ID == id {
			return song, nil
		}
	}

	return domain.Song{}, ErrSongNotFound
}

func (m *mockSongRepository) GetAll(archived bool) ([]domain.Song, error) {
	m.archivedArg = archived
	m.getAllCalled = true
	return m.songs, m.err
}

func (m *mockSongRepository) Update(song domain.Song) error {
	return m.err
}

func TestSongService_CreateSong(t *testing.T) {
	repository := &mockSongRepository{}
	service := NewSongService(repository)

	song, err := service.CreateSong("Test Song")
	if err != nil {
		t.Fatal(err)
	}

	if song.Title != "Test Song" {
		t.Errorf("expected title %q, got %q", "Test Song", song.Title)
	}

	if song.ID == (ulid.ULID{}) {
		t.Error("expected song ID to be generated")
	}

	if len(repository.songs) != 1 {
		t.Fatalf("expected repository to contain 1 song, got %d", len(repository.songs))
	}

	repositorySong := repository.songs[0]

	if repositorySong.Title != "Test Song" {
		t.Errorf(
			"expected repository to receive title %q, got %q",
			"Test Song",
			repositorySong.Title,
		)
	}

	if repositorySong.ID != song.ID {
		t.Error("expected repository to receive the same song ID")
	}
}

func TestSongService_CreateSong_RepositoryError(t *testing.T) {
	expectedErr := errors.New("database error")

	repository := &mockSongRepository{
		err: expectedErr,
	}

	service := NewSongService(repository)

	_, err := service.CreateSong("Test Song")
	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestSongService_GetSongByID(t *testing.T) {
	song := domain.Song{
		ID:    ulid.Make(),
		Title: "Test Song",
	}

	repository := &mockSongRepository{
		songs: []domain.Song{song},
	}

	service := NewSongService(repository)

	songDetails, err := service.GetSongByID(
		song.ID,
		SongByIDQuery{},
	)
	if err != nil {
		t.Fatal(err)
	}

	if songDetails.Song.ID != song.ID {
		t.Errorf(
			"expected song ID %s, got %s",
			song.ID,
			songDetails.Song.ID,
		)
	}

	if songDetails.Song.Title != song.Title {
		t.Errorf(
			"expected song title %q, got %q",
			song.Title,
			songDetails.Song.Title,
		)
	}
}

func TestSongService_GetAllSongs(t *testing.T) {
	song := domain.Song{
		ID:    ulid.Make(),
		Title: "Test Song",
	}

	song2 := domain.Song{
		ID:    ulid.Make(),
		Title: "Test Song 2",
	}

	repository := &mockSongRepository{
		songs: []domain.Song{song, song2},
	}

	service := NewSongService(repository)

	songsFromService, err := service.GetAllSongs(SongQuery{})
	if err != nil {
		t.Fatal(err)
	}

	if !repository.getAllCalled {
		t.Error("expected repository GetAll to be called")
	}

	if repository.archivedArg {
		t.Error("expected archived argument to be false")
	}

	if len(songsFromService) != 2 {
		t.Fatalf("expected service to return 2 songs, got %d", len(songsFromService))
	}

	if songsFromService[0].Song.ID != song.ID {
		t.Errorf(
			"expected first song ID %s, got %s",
			song.ID,
			songsFromService[0].Song.ID,
		)
	}

	if songsFromService[1].Song.ID != song2.ID {
		t.Errorf(
			"expected second song ID %s, got %s",
			song2.ID,
			songsFromService[1].Song.ID,
		)
	}
}

func TestSongService_GetAllSongs_Archived(t *testing.T) {
	repository := &mockSongRepository{}

	service := NewSongService(repository)

	query := SongQuery{
		Archived: true,
	}

	_, err := service.GetAllSongs(query)
	if err != nil {
		t.Fatal(err)
	}

	if !repository.getAllCalled {
		t.Error("expected repository GetAll to be called")
	}

	if !repository.archivedArg {
		t.Error("expected archived argument to be true")
	}
}

func TestSongService_GetAllSongs_RepositoryError(t *testing.T) {
	expectedErr := errors.New("database error")

	repository := &mockSongRepository{
		err: expectedErr,
	}

	service := NewSongService(repository)

	_, err := service.GetAllSongs(SongQuery{})
	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestSongService_UpdateSong(t *testing.T) {
	song := domain.Song{
		ID:    ulid.Make(),
		Title: "Test Song",
	}

	repository := &mockSongRepository{
		songs: []domain.Song{song},
	}

	service := NewSongService(repository)

	newTitle := "New Title"

	songFromService, err := service.UpdateSong(
		song.ID,
		&newTitle,
		nil,
	)
	if err != nil {
		t.Fatal(err)
	}

	if len(repository.songs) != 1 {
		t.Fatalf(
			"expected repository to contain 1 song, got %d",
			len(repository.songs),
		)
	}

	if songFromService.ID != song.ID {
		t.Errorf(
			"expected song ID %s, got %s",
			song.ID,
			songFromService.ID,
		)
	}

	if songFromService.Title != newTitle {
		t.Errorf(
			"expected song title %q, got %q",
			newTitle,
			songFromService.Title,
		)
	}

	archived := true

	archivedSongFromService, err := service.UpdateSong(
		song.ID,
		nil,
		&archived,
	)
	if err != nil {
		t.Fatal(err)
	}

	if archivedSongFromService.ArchivedAt == nil {
		t.Error("expected song to be archived")
	}

	archived = false

	archivedSongFromService, err = service.UpdateSong(
		song.ID,
		nil,
		&archived,
	)
	if err != nil {
		t.Fatal(err)
	}

	if archivedSongFromService.ArchivedAt != nil {
		t.Error("expected song to be unarchived")
	}
}
