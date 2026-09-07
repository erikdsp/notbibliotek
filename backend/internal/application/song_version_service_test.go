package application

import (
	"errors"
	"testing"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type mockSongVersionRepository struct {
	songVersions []domain.SongVersion
	err          error
}

func (m *mockSongVersionRepository) Create(songVersion domain.SongVersion) error {
	m.songVersions = append(m.songVersions, songVersion)
	return m.err
}

func TestSongVersionService_CreateSongVersion(t *testing.T) {
	songRepository := &mockSongRepository{}
	songService := NewSongService(songRepository)

	repository := &mockSongVersionRepository{}
	service := NewSongVersionService(repository, songRepository)

	song, err := songService.CreateSong("Test Song")
	if err != nil {
		t.Fatal(err)
	}

	songVersion, err := service.CreateSongVersion(song.ID)
	if err != nil {
		t.Fatal(err)
	}

	if len(repository.songVersions) != 1 {
		t.Fatalf("expected repository to contain 1 song version, got %d", len(repository.songVersions))
	}

	repositorySongVersion := repository.songVersions[0]

	if repositorySongVersion.ID != songVersion.ID {
		t.Errorf(
			"expected repository to get ID %q, got %q",
			songVersion.ID.String(),
			repositorySongVersion.ID.String(),
		)
	}

	if repositorySongVersion.SongID != song.ID {
		t.Error("expected repository version to contain the correct song ID")
	}
}

func TestSongVersionService_CreateSongVersion_SongNotFound(t *testing.T) {
	songRepository := &mockSongRepository{}
	repository := &mockSongVersionRepository{}
	service := NewSongVersionService(repository, songRepository)

	songID := ulid.Make()

	_, err := service.CreateSongVersion(songID)
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if len(repository.songVersions) != 0 {
		t.Fatalf(
			"expected repository to contain 0 song versions, got %d",
			len(repository.songVersions),
		)
	}
}

func TestSongVersionService_CreateSongVersion_RepositoryError(t *testing.T) {
	songID := ulid.Make()

	songRepository := &mockSongRepository{
		songs: []domain.Song{
			{
				ID:    songID,
				Title: "Test Song",
			},
		},
	}

	repositoryError := errors.New("repository error")

	repository := &mockSongVersionRepository{
		err: repositoryError,
	}

	service := NewSongVersionService(repository, songRepository)

	_, err := service.CreateSongVersion(songID)
	if !errors.Is(err, repositoryError) {
		t.Fatalf(
			"expected error %q, got %q",
			repositoryError,
			err,
		)
	}
}
