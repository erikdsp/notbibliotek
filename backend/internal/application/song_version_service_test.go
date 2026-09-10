package application

import (
	"errors"
	"io"
	"testing"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type mockSongVersionRepository struct {
	songVersions []domain.SongVersion
	err          error
}

func (m *mockSongVersionRepository) Create(songVersion domain.SongVersion) error {
	if m.err != nil {
		return m.err
	}

	m.songVersions = append(m.songVersions, songVersion)
	return nil
}

func (m *mockSongVersionRepository) GetByID(id ulid.ULID) (domain.SongVersion, error) {
	for _, songVersion := range m.songVersions {
		if songVersion.ID == id {
			return songVersion, nil
		}
	}

	return domain.SongVersion{}, ErrSongVersionNotFound
}

type mockFileRepository struct {
	files []domain.File
	err   error

	deletedFileIDs []ulid.ULID
	deleteErr      error
}

func (m *mockFileRepository) Create(file domain.File) error {
	if m.err != nil {
		return m.err
	}

	m.files = append(m.files, file)
	return nil
}

func (m *mockFileRepository) GetByID(id ulid.ULID) (domain.File, error) {
	for _, file := range m.files {
		if file.ID == id {
			return file, nil
		}
	}

	return domain.File{}, ErrFileNotFound
}

func (m *mockFileRepository) Update(file domain.File) error {
	return nil
}

func (m *mockFileRepository) Delete(id ulid.ULID) error {
	m.deletedFileIDs = append(m.deletedFileIDs, id)
	return m.deleteErr
}

type mockScoreRepository struct {
	scores          []domain.Score
	err             error
	getByVersionErr error
	updateErr       error
}

func (m *mockScoreRepository) Create(score domain.Score) error {
	if m.err != nil {
		return m.err
	}

	m.scores = append(m.scores, score)
	return nil
}

func (m *mockScoreRepository) GetByID(id ulid.ULID) (domain.Score, error) {
	for _, score := range m.scores {
		if score.ID == id {
			return score, nil
		}
	}

	return domain.Score{}, ErrScoreNotFound
}

func (m *mockScoreRepository) GetBySongVersionID(songVersionID ulid.ULID) (domain.Score, error) {
	if m.getByVersionErr != nil {
		return domain.Score{}, m.getByVersionErr
	}

	for _, score := range m.scores {
		if score.SongVersionID == songVersionID {
			return score, nil
		}
	}

	return domain.Score{}, ErrScoreNotFound
}

func (m *mockScoreRepository) Update(score domain.Score) error {
	if m.updateErr != nil {
		return m.updateErr
	}

	for i, existing := range m.scores {
		if existing.ID == score.ID {
			m.scores[i] = score
			return nil
		}
	}

	return ErrScoreNotFound
}

type mockFileStorage struct {
	savedFileIDs   []ulid.ULID
	deletedFileIDs []ulid.ULID

	saveErr   error
	deleteErr error
}

func (m *mockFileStorage) Save(fileID ulid.ULID, file io.Reader) error {
	if m.saveErr != nil {
		return m.saveErr
	}

	m.savedFileIDs = append(m.savedFileIDs, fileID)
	return nil
}

func (m *mockFileStorage) Load(fileID ulid.ULID) (io.ReadCloser, error) {
	return nil, nil
}

func (m *mockFileStorage) Delete(fileID ulid.ULID) error {
	m.deletedFileIDs = append(m.deletedFileIDs, fileID)
	return m.deleteErr
}

func Test_WhenSongExistsThenCreateSongVersionCreatesSongVersion(t *testing.T) {
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
	fileStorage := &mockFileStorage{}
	repository := &mockSongVersionRepository{}

	service := NewSongVersionService(
		repository,
		songRepository,
		fileRepository,
		scoreRepository,
		fileStorage,
	)

	songVersion, err := service.CreateSongVersion(songID)
	if err != nil {
		t.Fatal(err)
	}

	if len(repository.songVersions) != 1 {
		t.Fatalf(
			"expected repository to contain 1 song version, got %d",
			len(repository.songVersions),
		)
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

func Test_WhenSongDoesNotExistThenCreateSongVersionDoesNotCreateSongVersion(t *testing.T) {
	songRepository := &mockSongRepository{}
	repository := &mockSongVersionRepository{}
	fileRepository := &mockFileRepository{}
	scoreRepository := &mockScoreRepository{}
	fileStorage := &mockFileStorage{}

	service := NewSongVersionService(
		repository,
		songRepository,
		fileRepository,
		scoreRepository,
		fileStorage,
	)

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

func Test_WhenSongVersionRepositoryReturnsErrorThenCreateSongVersionAlsoReturnsError(t *testing.T) {
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
	fileStorage := &mockFileStorage{}

	service := NewSongVersionService(
		repository,
		songRepository,
		fileRepository,
		scoreRepository,
		fileStorage,
	)

	_, err := service.CreateSongVersion(songID)
	if !errors.Is(err, repositoryError) {
		t.Fatalf(
			"expected error %q, got %q",
			repositoryError,
			err,
		)
	}
}

func Test_WhenSongVersionServiceUploadsValidScoreThenUploadScoreCreatesTheExpectedScore(t *testing.T) {
	songID := ulid.Make()
	versionID := ulid.Make()

	repository := &mockSongVersionRepository{
		songVersions: []domain.SongVersion{
			{
				ID:     versionID,
				SongID: songID,
			},
		},
	}

	fileRepository := &mockFileRepository{}
	scoreRepository := &mockScoreRepository{}
	fileStorage := &mockFileStorage{}

	service := NewSongVersionService(
		repository,
		&mockSongRepository{},
		fileRepository,
		scoreRepository,
		fileStorage,
	)

	score, err := service.UploadScore(
		songID,
		versionID,
		"test.pdf",
		nil,
	)
	if err != nil {
		t.Fatal(err)
	}

	if len(fileStorage.savedFileIDs) != 1 {
		t.Fatalf(
			"expected storage to save 1 file, got %d",
			len(fileStorage.savedFileIDs),
		)
	}

	fileID := fileStorage.savedFileIDs[0]

	if len(fileRepository.files) != 1 {
		t.Fatalf(
			"expected file repository to contain 1 file, got %d",
			len(fileRepository.files),
		)
	}

	if fileRepository.files[0].ID != fileID {
		t.Error("expected file repository to contain the saved file ID")
	}

	if fileRepository.files[0].Name != "test.pdf" {
		t.Error("expected file repository to contain the correct file name")
	}

	if len(scoreRepository.scores) != 1 {
		t.Fatalf(
			"expected score repository to contain 1 score, got %d",
			len(scoreRepository.scores),
		)
	}

	if score.FileID != fileID {
		t.Error("expected score to contain the correct file ID")
	}

	if score.SongVersionID != versionID {
		t.Error("expected score to contain the correct song version ID")
	}

	if len(fileRepository.deletedFileIDs) != 0 {
		t.Error("expected no file repository rollback")
	}

	if len(fileStorage.deletedFileIDs) != 0 {
		t.Error("expected no file storage rollback")
	}
}

func Test_WhenSongVersionDoesNotExistThenUploadScoreReturnsSongVersionNotFound(t *testing.T) {
	songID := ulid.Make()
	versionID := ulid.Make()

	repository := &mockSongVersionRepository{}

	fileRepository := &mockFileRepository{}
	scoreRepository := &mockScoreRepository{}
	fileStorage := &mockFileStorage{}

	service := NewSongVersionService(
		repository,
		&mockSongRepository{},
		fileRepository,
		scoreRepository,
		fileStorage,
	)

	_, err := service.UploadScore(
		songID,
		versionID,
		"test.pdf",
		nil,
	)

	if !errors.Is(err, ErrSongVersionNotFound) {
		t.Fatalf(
			"expected error %q, got %q",
			ErrSongVersionNotFound,
			err,
		)
	}

	if len(fileStorage.savedFileIDs) != 0 {
		t.Error("expected no file to be saved")
	}
}

func Test_WhenSongVersionBelongsToTheWrongSongThenUploadScoreReturnsErrInvalidSongID(t *testing.T) {
	songID := ulid.Make()
	otherSongID := ulid.Make()
	versionID := ulid.Make()

	repository := &mockSongVersionRepository{
		songVersions: []domain.SongVersion{
			{
				ID:     versionID,
				SongID: otherSongID,
			},
		},
	}

	fileRepository := &mockFileRepository{}
	scoreRepository := &mockScoreRepository{}
	fileStorage := &mockFileStorage{}

	service := NewSongVersionService(
		repository,
		&mockSongRepository{},
		fileRepository,
		scoreRepository,
		fileStorage,
	)

	_, err := service.UploadScore(
		songID,
		versionID,
		"test.pdf",
		nil,
	)

	if !errors.Is(err, ErrInvalidSongID) {
		t.Fatalf(
			"expected error %q, got %q",
			ErrInvalidSongID,
			err,
		)
	}

	if len(fileStorage.savedFileIDs) != 0 {
		t.Error("expected no file to be saved")
	}
}

func Test_WhenFileStorageReturnsErrorThenSongVersionServiceUploadScoreAlsoReturnsError(t *testing.T) {
	songID := ulid.Make()
	versionID := ulid.Make()

	storageError := errors.New("storage error")

	repository := &mockSongVersionRepository{
		songVersions: []domain.SongVersion{
			{
				ID:     versionID,
				SongID: songID,
			},
		},
	}

	fileRepository := &mockFileRepository{}
	scoreRepository := &mockScoreRepository{}
	fileStorage := &mockFileStorage{
		saveErr: storageError,
	}

	service := NewSongVersionService(
		repository,
		&mockSongRepository{},
		fileRepository,
		scoreRepository,
		fileStorage,
	)

	_, err := service.UploadScore(
		songID,
		versionID,
		"test.pdf",
		nil,
	)

	if !errors.Is(err, storageError) {
		t.Fatalf(
			"expected error %q, got %q",
			storageError,
			err,
		)
	}

	if len(fileRepository.files) != 0 {
		t.Error("expected no file metadata to be created")
	}

	if len(scoreRepository.scores) != 0 {
		t.Error("expected no score to be created")
	}
}

func Test_WhenFileRepositoryReturnsErrorThenSongVersionServiceUploadScoreAlsoReturnsError(t *testing.T) {
	songID := ulid.Make()
	versionID := ulid.Make()

	fileError := errors.New("file repository error")

	repository := &mockSongVersionRepository{
		songVersions: []domain.SongVersion{
			{
				ID:     versionID,
				SongID: songID,
			},
		},
	}

	fileRepository := &mockFileRepository{
		err: fileError,
	}

	scoreRepository := &mockScoreRepository{}
	fileStorage := &mockFileStorage{}

	service := NewSongVersionService(
		repository,
		&mockSongRepository{},
		fileRepository,
		scoreRepository,
		fileStorage,
	)

	_, err := service.UploadScore(
		songID,
		versionID,
		"test.pdf",
		nil,
	)

	if !errors.Is(err, fileError) {
		t.Fatalf(
			"expected error %q, got %q",
			fileError,
			err,
		)
	}

	if len(fileStorage.deletedFileIDs) != 1 {
		t.Fatalf(
			"expected storage rollback to delete 1 file, got %d",
			len(fileStorage.deletedFileIDs),
		)
	}

	if fileStorage.deletedFileIDs[0] != fileStorage.savedFileIDs[0] {
		t.Error("expected rollback to delete the saved file")
	}

	if len(scoreRepository.scores) != 0 {
		t.Error("expected no score to be created")
	}
}

func Test_WhenSongVersionIsAlreadyPublishedThenSongVersionServiceUploadScoreReturnsErrInvalidOperation(t *testing.T) {
	songID := ulid.Make()
	versionID := ulid.Make()

	repository := &mockSongVersionRepository{
		songVersions: []domain.SongVersion{
			{
				ID:          versionID,
				SongID:      songID,
				PublishedAt: func() *time.Time { t := time.Now(); return &t }(),
			},
		},
	}

	fileRepository := &mockFileRepository{}
	scoreRepository := &mockScoreRepository{}
	fileStorage := &mockFileStorage{}

	service := NewSongVersionService(
		repository,
		&mockSongRepository{},
		fileRepository,
		scoreRepository,
		fileStorage,
	)

	_, err := service.UploadScore(songID, versionID, "test.pdf", nil)

	if !errors.Is(err, ErrInvalidOperation) {
		t.Fatalf("expected error %q, got %q", ErrInvalidOperation, err)
	}

	if len(fileStorage.savedFileIDs) != 0 {
		t.Error("expected no file to be saved")
	}
}

func Test_WhenScoreAlreadyExistsThenUploadScoreReturnsErrConflictingOperation(t *testing.T) {
	songID := ulid.Make()
	versionID := ulid.Make()

	repository := &mockSongVersionRepository{
		songVersions: []domain.SongVersion{
			{
				ID:          versionID,
				SongID:      songID,
				PublishedAt: nil,
			},
		},
	}

	scoreRepository := &mockScoreRepository{
		scores: []domain.Score{
			{
				ID:            ulid.Make(),
				SongVersionID: versionID,
				FileID:        ulid.Make(),
			},
		},
	}

	fileRepository := &mockFileRepository{}
	fileStorage := &mockFileStorage{}

	service := NewSongVersionService(
		repository,
		&mockSongRepository{},
		fileRepository,
		scoreRepository,
		fileStorage,
	)

	_, err := service.UploadScore(
		songID,
		versionID,
		"test.pdf",
		nil,
	)

	if !errors.Is(err, ErrConflictingOperation) {
		t.Fatalf(
			"expected error %q, got %q",
			ErrConflictingOperation,
			err,
		)
	}

	if len(fileStorage.savedFileIDs) != 0 {
		t.Error("expected no file to be saved")
	}
}
