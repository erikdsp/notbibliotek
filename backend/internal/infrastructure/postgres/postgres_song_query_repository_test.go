package postgres

import (
	"database/sql"
	"errors"
	"strings"
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

func Test_WhenRowIsMissingScoreThenToApplicationReturnsVersionWithoutScore(t *testing.T) {
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
				UUID:  uuid.UUID{},
				Valid: false,
			},
			FileID: uuid.NullUUID{
				UUID:  uuid.UUID{},
				Valid: false,
			},
		},
	}

	songDetails, _, err := row.toApplication()

	if err != nil {
		t.Fatal(err)
	}

	currentVersionID := *songDetails.CurrentVersionID

	if songDetails.Versions[currentVersionID].Score != nil {
		t.Error("expected score to be nil")
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

func Test_WhenArchivedIsTrueThenSongDetailsQueryFiltersForArchivedSongs(t *testing.T) {
	query := application.SongQuery{
		Archived: true,
	}

	builder := buildSongDetailsQuery(query)

	sql, _, err := builder.ToSql()
	if err != nil {
		t.Fatalf("failed to build SQL: %v", err)
	}

	if !strings.Contains(sql, "s.archived_at IS NOT NULL") {
		t.Errorf("expected archived filter, got query: %s", sql)
	}
}

func Test_WhenArchivedIsFalseThenSongDetailsQueryFiltersForNonArchivedSongs(t *testing.T) {
	query := application.SongQuery{
		Archived: false,
	}

	builder := buildSongDetailsQuery(query)

	sql, _, err := builder.ToSql()
	if err != nil {
		t.Fatalf("failed to build SQL: %v", err)
	}

	if !strings.Contains(sql, "s.archived_at IS NULL") {
		t.Errorf("expected non-archived filter, got query: %s", sql)
	}
}

func Test_WhenIncludeScoreIsTrueThenAddScoreColumnsIncludesScore(t *testing.T) {

	includeScore := true

	sqlBuilder := psql.Select("Test")
	sqlBuilder = addScoreColumns(sqlBuilder, includeScore)
	sql, _, err := sqlBuilder.ToSql()

	if err != nil {
		t.Fatal(err)
	}

	if !strings.Contains(sql, "score.id") {
		t.Errorf("expected query to include score.id, got: %s", sql)
	}

	if !strings.Contains(sql, "score.file_id") {
		t.Errorf("expected query to include score.file_id, got: %s", sql)
	}

	if !strings.Contains(sql, "JOIN scores") {
		t.Errorf("expected query to join scores, got: %s", sql)
	}
}

func Test_WhenIncludeScoreIsFalseThenAddScoreColumnsExcludesScore(t *testing.T) {

	includeScore := false

	sqlBuilder := psql.Select("Test")
	sqlBuilder = addScoreColumns(sqlBuilder, includeScore)
	sql, _, err := sqlBuilder.ToSql()

	if err != nil {
		t.Fatal(err)
	}

	if !strings.Contains(sql, "NULL AS score_id") {
		t.Errorf("expected NULL score id, got: %s", sql)
	}

	if !strings.Contains(sql, "NULL AS score_file_id") {
		t.Errorf("expected NULL score file_id, got: %s", sql)
	}

	if strings.Contains(sql, "JOIN scores") {
		t.Errorf("expected query not to join scores, got: %s", sql)
	}
}

func Test_WhenPartsAreProvidedThenSongDetailsQueryFiltersJoinedParts(t *testing.T) {
	query := application.SongQuery{
		Parts: []string{"violin1", "violin2"},
	}

	sql, args, err := buildSongDetailsQuery(query).ToSql()
	if err != nil {
		t.Fatal(err)
	}

	if !strings.Contains(sql, "LEFT JOIN parts part ON part.song_version_id = sv.id AND part.key IN ($1,$2)") {
		t.Errorf("expected query to filter joined parts, got: %s", sql)
	}

	if len(args) != 2 {
		t.Fatalf("expected 2 args, got %d", len(args))
	}

	if args[0] != "violin1" || args[1] != "violin2" {
		t.Errorf("unexpected args: %v", args)
	}

}

func Test_WhenPartsAreNotProvidedThenSongDetailsQueryIncludesAllParts(t *testing.T) {
	query := application.SongQuery{}

	sql, args, err := buildSongDetailsQuery(query).ToSql()
	if err != nil {
		t.Fatal(err)
	}

	if len(args) != 0 {
		t.Fatalf("expected 0 args, got %d", len(args))
	}

	if !strings.Contains(sql, "LEFT JOIN parts part ON part.song_version_id = sv.id") {
		t.Errorf("expected query to join parts, got: %s", sql)
	}

	if strings.Contains(sql, "AND part.key IN") {
		t.Errorf("expected query without part filtering, got: %s", sql)
	}

}
