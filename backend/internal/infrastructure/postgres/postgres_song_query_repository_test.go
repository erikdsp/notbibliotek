package postgres

import (
	"database/sql"
	"errors"
	"testing"

	"github.com/erikdsp/notbibliotek/backend/internal/application"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

func Test_WhenRowContainsValidSongVersionThenToApplicationReturnsCorrectSongDetails(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	scoreID := ulid.Make()
	fileID := ulid.Make()

	row := dbSongDetailRow{
		Song: dbSongDetail{
			ID:    uuid.UUID(songID),
			Title: "Test Song",
		},
		SongVersion: dbSongVersionDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(versionID),
				Valid: true,
			},
		},
		Score: dbScoreDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(scoreID),
				Valid: true,
			},
			FileID: uuid.NullUUID{
				UUID:  uuid.UUID(fileID),
				Valid: true,
			},
		},
	}

	songDetails, partDetails, err := row.toApplication()

	if err != nil {
		t.Fatal(err)
	}

	if songDetails.Song.ID != songID {
		t.Error("expected songIDs to match")
	}

	currentVersionID := *songDetails.CurrentVersionID

	if currentVersionID != versionID {
		t.Error("expected CurrentVersionID to match versionID")
	}

	if songDetails.Versions[currentVersionID].Score.ID != scoreID {
		t.Error("expected scoreIDs to match")
	}

	if partDetails != (application.PartDetails{}) {
		t.Error("expected partDetails to be empty")
	}
}

func Test_WhenRowContainsNoValidSongVersionThenToApplicationReturnsEmptyVersion(t *testing.T) {

	row := dbSongDetailRow{}

	songDetails, partDetails, err := row.toApplication()

	if err != nil {
		t.Fatal(err)
	}

	dummy := application.SongDetails{}
	if songDetails.Song.ID != dummy.Song.ID {
		t.Error("expected this empty test to be empty")
	}

	dummy2 := application.PartDetails{}
	if partDetails.ID != dummy2.ID {
		t.Error("expected this empty part test to be empty")
	}

}

func Test_WhenRowContainsPartThenToApplicationReturnsCorrectPart(t *testing.T) {

	songID := ulid.Make()
	versionID := ulid.Make()
	partID := ulid.Make()
	fileID := ulid.Make()

	row := dbSongDetailRow{
		Song: dbSongDetail{
			ID:    uuid.UUID(songID),
			Title: "Test Song",
		},
		SongVersion: dbSongVersionDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(versionID),
				Valid: true,
			},
		},
		Score: dbScoreDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(ulid.Make()),
				Valid: true,
			},
			FileID: uuid.NullUUID{
				UUID:  uuid.UUID(ulid.Make()),
				Valid: true,
			},
		},
		Part: dbPartDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(partID),
				Valid: true,
			},
			Key: sql.NullString{
				String: "key",
				Valid:  true,
			},
			Name: sql.NullString{
				String: "Name",
				Valid:  true,
			},
			FileID: uuid.NullUUID{
				UUID:  uuid.UUID(fileID),
				Valid: true,
			},
		},
	}

	_, partDetails, err := row.toApplication()

	if err != nil {
		t.Fatal(err)
	}

	if partDetails.ID != partID {
		t.Error("expected part IDs to match")
	}

	if partDetails.FileID != fileID {
		t.Error("expected part fileIDs to match")
	}

	if partDetails.Key != "key" {
		t.Error("expected part keys to match")
	}

	if partDetails.Name != "Name" {
		t.Error("expected part Names to match")
	}

}

func Test_WhenRowIsMissingScoreThenToApplicationReturnsCorrectError(t *testing.T) {

	row := dbSongDetailRow{
		Song: dbSongDetail{
			ID:    uuid.UUID(ulid.Make()),
			Title: "Test Song",
		},
		SongVersion: dbSongVersionDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(ulid.Make()),
				Valid: true,
			},
		},
	}

	_, _, err := row.toApplication()

	if !errors.Is(err, application.ErrScoreNotFound) {
		t.Fatalf(
			"expected error %q, got %q",
			application.ErrScoreNotFound,
			err,
		)
	}
}

func Test_WhenRowHasIncompleteScoreThenToApplicationReturnsCorrectError(t *testing.T) {

	row := dbSongDetailRow{
		Song: dbSongDetail{
			ID:    uuid.UUID(ulid.Make()),
			Title: "Test Song",
		},
		SongVersion: dbSongVersionDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(ulid.Make()),
				Valid: true,
			},
		},
		Score: dbScoreDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(ulid.Make()),
				Valid: true,
			},
		},
	}

	_, _, err := row.toApplication()

	if !errors.Is(err, application.ErrIncompleteScore) {
		t.Fatalf(
			"expected error %q, got %q",
			application.ErrIncompleteScore,
			err,
		)
	}
}

func Test_WhenRowHasIncompletePartThenToApplicationReturnsCorrectError(t *testing.T) {

	row := dbSongDetailRow{
		Song: dbSongDetail{
			ID:    uuid.UUID(ulid.Make()),
			Title: "Test Song",
		},
		SongVersion: dbSongVersionDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(ulid.Make()),
				Valid: true,
			},
		},
		Score: dbScoreDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(ulid.Make()),
				Valid: true,
			},
			FileID: uuid.NullUUID{
				UUID:  uuid.UUID(ulid.Make()),
				Valid: true,
			},
		},
		Part: dbPartDetail{
			ID: uuid.NullUUID{
				UUID:  uuid.UUID(ulid.Make()),
				Valid: true,
			},
		},
	}

	_, _, err := row.toApplication()

	if !errors.Is(err, application.ErrIncompletePart) {
		t.Fatalf(
			"expected error %q, got %q",
			application.ErrIncompletePart,
			err,
		)
	}
}
