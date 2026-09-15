package application

import (
	"errors"
	"io"
	"strings"
	"testing"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

func Test_WhenSongExistsThenCreateSongVersionCreatesSongVersion(t *testing.T) {

	songID := ulid.Make()
	title := "Test Song"
	f := newSongVersionServiceFixture(&songID, title, nil)

	songVersion, err := f.service.CreateSongVersion(songID)
	if err != nil {
		t.Fatal(err)
	}

	if len(f.repository.songVersions) != 1 {
		t.Fatalf(
			"expected repository to contain 1 song version, got %d",
			len(f.repository.songVersions),
		)
	}

	repositorySongVersion := f.repository.songVersions[0]

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

	f := newSongVersionServiceFixture(nil, "", nil)
	songID := ulid.Make()

	_, err := f.service.CreateSongVersion(songID)
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if len(f.repository.songVersions) != 0 {
		t.Fatalf(
			"expected repository to contain 0 song versions, got %d",
			len(f.repository.songVersions),
		)
	}
}

func Test_WhenSongVersionRepositoryReturnsErrorThenCreateSongVersionAlsoReturnsError(t *testing.T) {

	songID := ulid.Make()
	repositoryError := errors.New("repository error")
	f := newSongVersionServiceFixture(&songID, "Test Song", nil)
	f.repository.err = repositoryError

	_, err := f.service.CreateSongVersion(songID)
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
	f := newSongVersionServiceFixture(&songID, "", &versionID)

	score, err := f.service.UploadScore(
		songID,
		versionID,
		"test.pdf",
		nil,
	)
	if err != nil {
		t.Fatal(err)
	}

	if len(f.fileStorage.savedFileIDs) != 1 {
		t.Fatalf(
			"expected storage to save 1 file, got %d",
			len(f.fileStorage.savedFileIDs),
		)
	}

	fileID := f.fileStorage.savedFileIDs[0]

	if len(f.fileRepository.files) != 1 {
		t.Fatalf(
			"expected file repository to contain 1 file, got %d",
			len(f.fileRepository.files),
		)
	}

	if f.fileRepository.files[0].ID != fileID {
		t.Error("expected file repository to contain the saved file ID")
	}

	if f.fileRepository.files[0].Name != "test.pdf" {
		t.Error("expected file repository to contain the correct file name")
	}

	if len(f.scoreRepository.scores) != 1 {
		t.Fatalf(
			"expected score repository to contain 1 score, got %d",
			len(f.scoreRepository.scores),
		)
	}

	if score.FileID != fileID {
		t.Error("expected score to contain the correct file ID")
	}

	if score.SongVersionID != versionID {
		t.Error("expected score to contain the correct song version ID")
	}

	if len(f.fileRepository.deletedFileIDs) != 0 {
		t.Error("expected no file repository rollback")
	}

	if len(f.fileStorage.deletedFileIDs) != 0 {
		t.Error("expected no file storage rollback")
	}
}

func Test_WhenSongVersionDoesNotExistThenUploadScoreReturnsSongVersionNotFound(t *testing.T) {

	f := newSongVersionServiceFixture(nil, "", nil)
	songID := ulid.Make()
	versionID := ulid.Make()

	_, err := f.service.UploadScore(
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

	if len(f.fileStorage.savedFileIDs) != 0 {
		t.Error("expected no file to be saved")
	}
}

func Test_WhenSongVersionBelongsToTheWrongSongThenUploadScoreReturnsErrInvalidSongID(t *testing.T) {

	songID := ulid.Make()
	otherSongID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&otherSongID, "", &versionID)

	_, err := f.service.UploadScore(
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

	if len(f.fileStorage.savedFileIDs) != 0 {
		t.Error("expected no file to be saved")
	}
}

func Test_WhenFileStorageReturnsErrorThenUploadScoreAlsoReturnsError(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	storageError := errors.New("storage error")
	f := newSongVersionServiceFixture(&songID, "", &versionID)
	f.fileStorage.saveErr = storageError

	_, err := f.service.UploadScore(
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

	if len(f.fileRepository.files) != 0 {
		t.Error("expected no file metadata to be created")
	}

	if len(f.scoreRepository.scores) != 0 {
		t.Error("expected no score to be created")
	}
}

func Test_WhenFileRepositoryReturnsErrorThenUploadScoreAlsoReturnsError(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	fileError := errors.New("file repository error")
	f := newSongVersionServiceFixture(&songID, "", &versionID)
	f.fileRepository.err = fileError

	_, err := f.service.UploadScore(
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

	if len(f.fileStorage.deletedFileIDs) != 1 {
		t.Fatalf(
			"expected storage rollback to delete 1 file, got %d",
			len(f.fileStorage.deletedFileIDs),
		)
	}

	if f.fileStorage.deletedFileIDs[0] != f.fileStorage.savedFileIDs[0] {
		t.Error("expected rollback to delete the saved file")
	}

	if len(f.scoreRepository.scores) != 0 {
		t.Error("expected no score to be created")
	}
}

func Test_WhenSongVersionIsAlreadyPublishedThenSongVersionServiceUploadScoreReturnsErrInvalidOperation(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	now := time.Now()
	f := newSongVersionServiceFixture(&songID, "", &versionID)
	f.repository.songVersions[0].PublishedAt = &now

	_, err := f.service.UploadScore(songID, versionID, "test.pdf", nil)

	if !errors.Is(err, ErrInvalidOperation) {
		t.Fatalf("expected error %q, got %q", ErrInvalidOperation, err)
	}

	if len(f.fileStorage.savedFileIDs) != 0 {
		t.Error("expected no file to be saved")
	}
}

func Test_WhenScoreAlreadyExistsThenUploadScoreReturnsErrConflictingOperation(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "", &versionID)
	f.scoreRepository.scores = append(f.scoreRepository.scores, domain.Score{
		ID:            ulid.Make(),
		SongVersionID: versionID,
		FileID:        ulid.Make(),
	})

	_, err := f.service.UploadScore(
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

	if len(f.fileStorage.savedFileIDs) != 0 {
		t.Error("expected no file to be saved")
	}
}

func Test_WhenScoreExistsThenUpdateScoreReplacesScoreFile(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	scoreID := ulid.Make()
	oldFileID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "", &versionID)
	f.scoreRepository.scores = append(f.scoreRepository.scores, domain.Score{
		ID:            scoreID,
		SongVersionID: versionID,
		FileID:        oldFileID,
	})

	score, err := f.service.UpdateScore(
		songID,
		versionID,
		"new-score.pdf",
		strings.NewReader("new pdf content"),
	)
	if err != nil {
		t.Fatal(err)
	}

	if score.ID != scoreID {
		t.Errorf(
			"expected score ID %q, got %q",
			scoreID.String(),
			score.ID.String(),
		)
	}

	if score.FileID == oldFileID {
		t.Error("expected score to reference a new file")
	}

	if len(f.fileStorage.savedFileIDs) != 1 {
		t.Fatalf(
			"expected 1 file to be saved, got %d",
			len(f.fileStorage.savedFileIDs),
		)
	}

	newFileID := f.fileStorage.savedFileIDs[0]

	if score.FileID != newFileID {
		t.Error("expected score to reference the new file")
	}

	if len(f.fileRepository.deletedFileIDs) != 1 {
		t.Fatalf(
			"expected old file metadata to be deleted, got %d deletions",
			len(f.fileRepository.deletedFileIDs),
		)
	}

	if f.fileRepository.deletedFileIDs[0] != oldFileID {
		t.Error("expected old file metadata to be deleted")
	}

	if len(f.fileStorage.deletedFileIDs) != 1 {
		t.Fatalf(
			"expected old file to be deleted, got %d deletions",
			len(f.fileStorage.deletedFileIDs),
		)
	}

	if f.fileStorage.deletedFileIDs[0] != oldFileID {
		t.Error("expected old file to be deleted")
	}
}

func Test_WhenScoreDoesNotExistThenUpdateScoreReturnsScoreNotFound(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "", &versionID)

	_, err := f.service.UpdateScore(
		songID,
		versionID,
		"score.pdf",
		strings.NewReader("pdf content"),
	)

	if !errors.Is(err, ErrScoreNotFound) {
		t.Fatalf(
			"expected error %q, got %q",
			ErrScoreNotFound,
			err,
		)
	}

	if len(f.fileStorage.savedFileIDs) != 0 {
		t.Error("expected no file to be saved")
	}
}

func Test_WhenUploadingValidPartThenUploadPartCreatesTheExpectedPart(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	key := "partkey"
	name := "Part Name"
	f := newSongVersionServiceFixture(&songID, "", &versionID)

	part, err := f.service.UploadPart(
		songID,
		versionID,
		key,
		name,
		"test.pdf",
		nil,
	)
	if err != nil {
		t.Fatal(err)
	}

	if len(f.fileStorage.savedFileIDs) != 1 {
		t.Fatalf(
			"expected storage to save 1 file, got %d",
			len(f.fileStorage.savedFileIDs),
		)
	}

	fileID := f.fileStorage.savedFileIDs[0]

	if len(f.fileRepository.files) != 1 {
		t.Fatalf(
			"expected file repository to contain 1 file, got %d",
			len(f.fileRepository.files),
		)
	}

	if f.fileRepository.files[0].ID != fileID {
		t.Error("expected file repository to contain the saved file ID")
	}

	if f.fileRepository.files[0].Name != "test.pdf" {
		t.Error("expected file repository to contain the correct file name")
	}

	if len(f.partRepository.parts) != 1 {
		t.Fatalf(
			"expected part repository to contain 1 part, got %d",
			len(f.partRepository.parts),
		)
	}

	if part.FileID != fileID {
		t.Error("expected part to contain the correct file ID")
	}

	if part.SongVersionID != versionID {
		t.Error("expected part to contain the correct song version ID")
	}

	if len(f.fileRepository.deletedFileIDs) != 0 {
		t.Error("expected no file repository rollback")
	}

	if len(f.fileStorage.deletedFileIDs) != 0 {
		t.Error("expected no file storage rollback")
	}
}

func Test_WhenPartWithSameKeyAlreadyExistsThenUploadPartReturnsErrConflictingOperation(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	key := "partkey"
	name := "Part Name"
	f := newSongVersionServiceFixture(&songID, "", &versionID)
	f.partRepository.parts = append(f.partRepository.parts, domain.Part{
		ID:            ulid.Make(),
		Key:           key,
		Name:          name,
		SongVersionID: versionID,
		FileID:        ulid.Make(),
	})

	_, err := f.service.UploadPart(
		songID,
		versionID,
		key,
		name,
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

}

func Test_WhenSongVersionDoesNotExistThenUploadPartReturnsSongVersionNotFound(t *testing.T) {

	f := newSongVersionServiceFixture(nil, "", nil)
	songID := ulid.Make()
	versionID := ulid.Make()

	_, err := f.service.UploadPart(
		songID,
		versionID,
		"partkey",
		"Part Name",
		"test.pdf",
		nil,
	)

	if !errors.Is(err, ErrSongVersionNotFound) {
		t.Fatalf("expected SongVersionNotFound, got %v", err)
	}
}

func Test_WhenSongIDDoesNotMatchSongVersionThenUploadPartReturnsInvalidSongID(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "", nil)
	f.repository.songVersions = append(f.repository.songVersions, domain.SongVersion{
		ID:     versionID,
		SongID: ulid.Make(),
	})

	_, err := f.service.UploadPart(
		songID,
		versionID,
		"partkey",
		"Part Name",
		"test.pdf",
		nil,
	)

	if !errors.Is(err, ErrInvalidSongID) {
		t.Fatalf("expected InvalidSongID, got %v", err)
	}
}

func Test_WhenPartExistsThenUpdatePartReplacesPartFile(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	partID := ulid.Make()
	key := "partkey"
	name := "Part Name"
	oldFileID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "", &versionID)
	f.partRepository.parts = append(f.partRepository.parts, domain.Part{
		ID:            partID,
		Key:           key,
		Name:          name,
		SongVersionID: versionID,
		FileID:        oldFileID,
	})

	part, err := f.service.UpdatePart(
		songID,
		versionID,
		key,
		name,
		"new-part.pdf",
		strings.NewReader("new pdf content"),
	)
	if err != nil {
		t.Fatal(err)
	}

	if part.ID != partID {
		t.Errorf(
			"expected part ID %q, got %q",
			partID.String(),
			part.ID.String(),
		)
	}

	if part.FileID == oldFileID {
		t.Error("expected part to reference a new file")
	}

	if len(f.fileStorage.savedFileIDs) != 1 {
		t.Fatalf(
			"expected 1 file to be saved, got %d",
			len(f.fileStorage.savedFileIDs),
		)
	}

	newFileID := f.fileStorage.savedFileIDs[0]

	if part.FileID != newFileID {
		t.Error("expected part to reference the new file")
	}

	if len(f.fileRepository.deletedFileIDs) != 1 {
		t.Fatalf(
			"expected old file metadata to be deleted, got %d deletions",
			len(f.fileRepository.deletedFileIDs),
		)
	}

	if f.fileRepository.deletedFileIDs[0] != oldFileID {
		t.Error("expected old file metadata to be deleted")
	}

	if len(f.fileStorage.deletedFileIDs) != 1 {
		t.Fatalf(
			"expected old file to be deleted, got %d deletions",
			len(f.fileStorage.deletedFileIDs),
		)
	}

	if f.fileStorage.deletedFileIDs[0] != oldFileID {
		t.Error("expected old file to be deleted")
	}
}

func Test_WhenSongVersionDoesNotExistThenUpdatePartReturnsSongVersionNotFound(t *testing.T) {

	f := newSongVersionServiceFixture(nil, "", nil)
	songID := ulid.Make()
	versionID := ulid.Make()

	_, err := f.service.UpdatePart(
		songID,
		versionID,
		"partkey",
		"Part Name",
		"test.pdf",
		nil,
	)

	if !errors.Is(err, ErrSongVersionNotFound) {
		t.Fatalf("expected SongVersionNotFound, got %v", err)
	}
}

func Test_WhenPartDoesNotExistThenUpdatePartReturnsPartNotFound(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "", &versionID)

	_, err := f.service.UpdatePart(
		songID,
		versionID,
		"partkey",
		"Part Name",
		"test.pdf",
		nil,
	)

	if !errors.Is(err, ErrPartNotFound) {
		t.Fatalf("expected PartNotFound, got %v", err)
	}
}

func Test_WhenSongVersionIsAlreadyPublishedThenUpdatePartReturnsErrInvalidOperation(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	key := "partkey"
	name := "Part Name"
	now := time.Now()
	f := newSongVersionServiceFixture(&songID, "", &versionID)
	f.repository.songVersions[0].PublishedAt = &now

	_, err := f.service.UpdatePart(
		songID,
		versionID,
		key,
		name,
		"test.pdf",
		nil,
	)

	if !errors.Is(err, ErrInvalidOperation) {
		t.Fatalf(
			"expected error %q, got %q",
			ErrInvalidOperation,
			err,
		)
	}

}

func Test_WhenPartRepositoryReturnsErrorThenUpdatePartReturnsErrorAndPerformsRollback(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	partID := ulid.Make()
	fileID := ulid.Make()
	key := "partkey"
	name := "Part Name"
	partError := errors.New("part repository error")
	f := newSongVersionServiceFixture(&songID, "", &versionID)
	f.partRepository.parts = append(f.partRepository.parts, domain.Part{
		ID:            partID,
		Key:           key,
		Name:          name,
		SongVersionID: versionID,
		FileID:        fileID,
	})
	f.partRepository.updateErr = partError

	_, err := f.service.UpdatePart(
		songID,
		versionID,
		key,
		name,
		"test.pdf",
		nil,
	)

	if !errors.Is(err, partError) {
		t.Fatalf(
			"expected error %q, got %q",
			partError,
			err,
		)
	}

	if len(f.fileStorage.deletedFileIDs) != 1 {
		t.Fatalf(
			"expected storage rollback to delete 1 file, got %d",
			len(f.fileStorage.deletedFileIDs),
		)
	}

	if f.fileStorage.deletedFileIDs[0] != f.fileStorage.savedFileIDs[0] {
		t.Error("expected rollback to delete the saved file")
	}

	if len(f.partRepository.parts) != 1 {
		t.Error("expected one part in repository")
	}

	if len(f.fileRepository.deletedFileIDs) != 1 {
		t.Fatalf(
			"expected repository rollback to delete 1 file ID, got %d",
			len(f.fileStorage.deletedFileIDs),
		)
	}

	if f.fileRepository.deletedFileIDs[0] != f.partRepository.fileIDsPassedToUpdate[0] {
		t.Error("expected rollback to delete the saved file")
	}

}

func Test_WhenValidVersionHasScoreAndZeroPartsThenPublishSongVersionIsSuccessful(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	fileID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "Valid Song", &versionID)
	f.scoreRepository.Create(domain.Score{
		ID:            ulid.Make(),
		SongVersionID: versionID,
		FileID:        fileID,
	})

	version, err := f.service.PublishSongVersion(
		songID,
		versionID,
	)

	if err != nil {
		t.Fatalf("expected successful publish, got %v", err)
	}

	if version.Version.SongID != songID {
		t.Error("expected published SongID to match songID")
	}
	if version.Version.ID != versionID {
		t.Error("expected published SongVersionID to match versionID")
	}

	if f.repository.songVersions[0].PublishedAt == nil {
		t.Error("expected song version to be published")
	}
}

func Test_WhenSongVersionIsMissingThenPublishSongVersionReturnsCorrectError(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "", nil)

	_, err := f.service.PublishSongVersion(
		songID,
		versionID,
	)

	if err != ErrSongVersionNotFound {
		t.Fatalf("expected ErrSongVersionNotFound, got %v", err)
	}

}

func Test_WhenSongIDIsInvalidThenPublishSongVersionReturnsCorrectError(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "", &versionID)

	anotherSongID := ulid.Make()
	_, err := f.service.PublishSongVersion(
		anotherSongID,
		versionID,
	)

	if err != ErrInvalidSongID {
		t.Fatalf("expected ErrInvalidSongID, got %v", err)
	}

	if f.repository.songVersions[0].PublishedAt != nil {
		t.Error("expected song version to not be published")
	}

}

func Test_WhenVersionIsAlreadyPublishedThenPublishSongVersionReturnsCorrectError(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "", &versionID)
	now := time.Now()
	f.repository.songVersions[0].PublishedAt = &now

	_, err := f.service.PublishSongVersion(
		songID,
		versionID,
	)

	if err != ErrSongVersionAlreadyPublished {
		t.Fatalf("expected ErrSongVersionAlreadyPublished, got %v", err)
	}

}

func Test_WhenScoreIsMissingThenPublishSongVersionReturnsCorrectError(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "", &versionID)

	_, err := f.service.PublishSongVersion(
		songID,
		versionID,
	)

	if err != ErrMissingScore {
		t.Fatalf("expected ErrMissingScore, got %v", err)
	}

	if f.repository.songVersions[0].PublishedAt != nil {
		t.Error("expected song version to not be published")
	}
}

func Test_WhenPartRepositoryReturnsErrorThenPublishSongVersionReturnsError(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "Song", &versionID)
	f.scoreRepository.Create(domain.Score{
		ID:            ulid.Make(),
		SongVersionID: versionID,
		FileID:        ulid.Make(),
	})
	partError := errors.New("part error")
	f.partRepository.err = partError

	_, err := f.service.PublishSongVersion(
		songID,
		versionID,
	)

	if err != partError {
		t.Fatalf("expected partError, got %v", err)
	}

	if f.repository.songVersions[0].PublishedAt != nil {
		t.Error("expected song version to not be published")
	}
}

func Test_WhenSongVersionRepositoryReturnsErrorThenPublishSongVersionReturnsError(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	f := newSongVersionServiceFixture(&songID, "Song", &versionID)
	f.scoreRepository.Create(domain.Score{
		ID:            ulid.Make(),
		SongVersionID: versionID,
		FileID:        ulid.Make(),
	})
	songVersionError := errors.New("song version error")
	f.repository.err = songVersionError

	_, err := f.service.PublishSongVersion(
		songID,
		versionID,
	)

	if err != songVersionError {
		t.Fatalf("expected songVersionError, got %v", err)
	}

	if f.repository.songVersions[0].PublishedAt != nil {
		t.Error("expected song version to not be published")
	}
}

// Test setup

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

func (m *mockSongVersionRepository) Update(songVersion domain.SongVersion) error {
	if m.err != nil {
		return m.err
	}

	for i, repoSongVersion := range m.songVersions {
		if repoSongVersion.ID == songVersion.ID {
			m.songVersions[i].PublishedAt = songVersion.PublishedAt
			return nil
		}
	}

	return ErrSongVersionNotFound
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

type MockPartRepository struct {
	parts                 []domain.Part
	err                   error
	getByVersionAndKeyErr error
	updateErr             error
	fileIDsPassedToUpdate []ulid.ULID
}

func (m *MockPartRepository) Create(part domain.Part) error {
	if m.err != nil {
		return m.err
	}

	m.parts = append(m.parts, part)
	return nil
}

func (m *MockPartRepository) GetByID(id ulid.ULID) (domain.Part, error) {
	for _, part := range m.parts {
		if part.ID == id {
			return part, nil
		}
	}
	return domain.Part{}, ErrPartNotFound
}

func (m *MockPartRepository) GetBySongVersionIDAndKey(songVersionID ulid.ULID, key string) (domain.Part, error) {
	if m.getByVersionAndKeyErr != nil {
		return domain.Part{}, m.getByVersionAndKeyErr
	}

	for _, part := range m.parts {
		if part.SongVersionID == songVersionID {
			return part, nil
		}
	}
	return domain.Part{}, ErrPartNotFound
}

func (m *MockPartRepository) GetBySongVersionID(songVersionID ulid.ULID) ([]domain.Part, error) {
	if m.err != nil {
		return []domain.Part{}, m.err
	}

	parts := []domain.Part{}

	for _, part := range m.parts {
		if part.SongVersionID == songVersionID {
			parts = append(parts, part)
		}
	}

	return parts, nil
}

func (m *MockPartRepository) Update(part domain.Part) error {
	m.fileIDsPassedToUpdate = append(m.fileIDsPassedToUpdate, part.FileID)

	if m.updateErr != nil {
		return m.updateErr
	}
	if m.err != nil {
		return m.err
	}

	for i, existing := range m.parts {
		if existing.ID == part.ID {
			m.parts[i] = part
			return nil
		}
	}

	return ErrPartNotFound

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

type songVersionServiceFixture struct {
	service         *SongVersionService
	repository      *mockSongVersionRepository
	songRepository  *mockSongRepository
	fileRepository  *mockFileRepository
	scoreRepository *mockScoreRepository
	partRepository  *MockPartRepository
	fileStorage     *mockFileStorage
}

// Helper factory for test setup
func newSongVersionServiceFixture(songID *ulid.ULID, title string, versionID *ulid.ULID) songVersionServiceFixture {

	repository := &mockSongVersionRepository{}
	songRepository := &mockSongRepository{}
	fileRepository := &mockFileRepository{}
	scoreRepository := &mockScoreRepository{}
	partRepository := &MockPartRepository{}
	fileStorage := &mockFileStorage{}

	if versionID != nil && songID != nil {
		repository.songVersions = append(repository.songVersions, domain.SongVersion{
			ID:     *versionID,
			SongID: *songID,
		},
		)
	}

	if songID != nil {
		songRepository.songs = append(songRepository.songs, domain.Song{
			ID:    *songID,
			Title: title,
		})
	}

	return songVersionServiceFixture{
		service: NewSongVersionService(
			repository,
			songRepository,
			fileRepository,
			scoreRepository,
			partRepository,
			fileStorage,
		),
		repository:      repository,
		fileRepository:  fileRepository,
		scoreRepository: scoreRepository,
		partRepository:  partRepository,
		fileStorage:     fileStorage,
	}
}
