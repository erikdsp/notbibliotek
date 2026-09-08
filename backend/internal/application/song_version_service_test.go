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

type mockFileRepository struct {
	files []domain.File
	err   error
}

func (m *mockFileRepository) Create(file domain.File) error {
	m.files = append(m.files, file)
	return m.err
}

func (m *mockFileRepository) GetByID(id ulid.ULID) (domain.File, error) {
	return domain.File{}, nil
}
func (m *mockFileRepository) Update(file domain.File) error {
	return nil
}

type mockScoreRepository struct {
	scores []domain.Score
	err    error
}

func (m *mockScoreRepository) Create(score domain.Score) error {
	m.scores = append(m.scores, score)
	return m.err
}

func (m *mockScoreRepository) GetByID(id ulid.ULID) (domain.Score, error) {
	return domain.Score{}, nil
}

func TestSongVersionService_CreateSongVersion(t *testing.T) {
	songID := ulid.Make()
	songRepository := &mockSongRepository{
		songs: []domain.Song{
			{
				ID:    songID,
				Title: "Test Song",
			},
		},
	}

	fileRepository := &mockFileRepository{}
	scoreRepository := &mockScoreRepository{}

	repository := &mockSongVersionRepository{}
	service := NewSongVersionService(repository, songRepository, fileRepository, scoreRepository)

	songVersion, err := service.CreateSongVersion(songID)
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

	if repositorySongVersion.SongID != songID {
		t.Error("expected repository version to contain the correct song ID")
	}
}

func TestSongVersionService_CreateSongVersion_SongNotFound(t *testing.T) {
	songRepository := &mockSongRepository{}
	repository := &mockSongVersionRepository{}
	fileRepository := &mockFileRepository{}
	scoreRepository := &mockScoreRepository{}

	service := NewSongVersionService(repository, songRepository, fileRepository, scoreRepository)

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

	fileRepository := &mockFileRepository{}
	scoreRepository := &mockScoreRepository{}

	service := NewSongVersionService(repository, songRepository, fileRepository, scoreRepository)

	_, err := service.CreateSongVersion(songID)
	if !errors.Is(err, repositoryError) {
		t.Fatalf(
			"expected error %q, got %q",
			repositoryError,
			err,
		)
	}
}
