package postgres

import (
	"database/sql"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	sq "github.com/Masterminds/squirrel"
	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

type PostgresSongQueryRepository struct {
	db *sql.DB
}

type dbSongDetail struct {
	ID         uuid.UUID
	Title      string
	ArchivedAt *time.Time
}

type dbSongVersionDetail struct {
	ID          uuid.NullUUID
	PublishedAt *time.Time
}

type dbScoreDetail struct {
	ID     uuid.NullUUID
	FileID uuid.NullUUID
}

type dbPartDetail struct {
	ID     uuid.NullUUID
	Key    sql.NullString
	Name   sql.NullString
	FileID uuid.NullUUID
}

type dbSongDetailRow struct {
	Song        dbSongDetail
	SongVersion dbSongVersionDetail
	Score       dbScoreDetail
	Part        dbPartDetail
}

func NewPostgresSongQueryRepository(db *sql.DB) *PostgresSongQueryRepository {
	return &PostgresSongQueryRepository{
		db: db,
	}
}

func (s dbSongDetailRow) toApplication() (application.SongDetails, application.PartDetails, error) {

	songID := ulid.ULID(s.Song.ID)
	song := domain.Song{
		ID:         ulid.ULID(s.Song.ID),
		Title:      s.Song.Title,
		ArchivedAt: s.Song.ArchivedAt,
	}

	if !s.SongVersion.ID.Valid {
		return application.SongDetails{
			Song:             song,
			CurrentVersionID: nil,
			Versions:         map[ulid.ULID]*application.VersionDetails{},
		}, application.PartDetails{}, nil
	}

	songVersionID := ulid.ULID(s.SongVersion.ID.UUID)

	var score *application.ScoreDetails

	if s.Score.ID.Valid != s.Score.FileID.Valid {
		return application.SongDetails{},
			application.PartDetails{},
			application.ErrIncompleteScore
	}

	if s.Score.ID.Valid {
		score = &application.ScoreDetails{
			ID:     ulid.ULID(s.Score.ID.UUID),
			FileID: ulid.ULID(s.Score.FileID.UUID),
		}
	}

	songDetails := application.SongDetails{
		Song: domain.Song{
			ID:         songID,
			Title:      s.Song.Title,
			ArchivedAt: s.Song.ArchivedAt,
		},
		CurrentVersionID: &songVersionID,
		Versions: map[ulid.ULID]*application.VersionDetails{
			songVersionID: {
				Version: application.SongVersionDetails{
					ID:          songVersionID,
					PublishedAt: s.SongVersion.PublishedAt,
				},
				Score: score,
			},
		},
	}

	if !s.Part.ID.Valid {
		return songDetails, application.PartDetails{}, nil
	}

	if !s.Part.FileID.Valid || !s.Part.Key.Valid || !s.Part.Name.Valid {
		return songDetails, application.PartDetails{}, application.ErrIncompletePart
	}

	partDetails := application.PartDetails{
		ID:     ulid.ULID(s.Part.ID.UUID),
		Key:    s.Part.Key.String,
		Name:   s.Part.Name.String,
		FileID: ulid.ULID(s.Part.FileID.UUID),
	}

	return songDetails, partDetails, nil
}

func (r *PostgresSongQueryRepository) GetAll(query application.SongQuery) ([]application.SongDetails, error) {

	sql := buildSongDetailsQuery(query)

	queryString, args, err := sql.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := r.db.Query(
		queryString, args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	songs := make(map[ulid.ULID]*application.SongDetails)
	var songOrder []ulid.ULID
	var prevSongID *ulid.ULID

	for rows.Next() {
		var dbRow dbSongDetailRow

		err := rows.Scan(
			&dbRow.Song.ID,
			&dbRow.Song.Title,
			&dbRow.Song.ArchivedAt,
			&dbRow.SongVersion.ID,
			&dbRow.SongVersion.PublishedAt,
			&dbRow.Score.ID,
			&dbRow.Score.FileID,
			&dbRow.Part.ID,
			&dbRow.Part.Key,
			&dbRow.Part.Name,
			&dbRow.Part.FileID,
		)
		if err != nil {
			return nil, err
		}

		song, part, err := dbRow.toApplication()
		if err != nil {
			return nil, err
		}

		currentSongID := song.Song.ID

		if prevSongID == nil || currentSongID != *prevSongID {
			songs[currentSongID] = &song
			songOrder = append(songOrder, currentSongID)
			prevSongID = &currentSongID
		}
		if song.CurrentVersionID != nil && part.ID != (ulid.ULID{}) {
			version := songs[currentSongID].Versions[*song.CurrentVersionID]
			version.Parts = append(version.Parts, part)
		}

	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	result := make([]application.SongDetails, 0, len(songOrder))
	for _, id := range songOrder {
		result = append(result, *songs[id])
	}

	return result, nil
}

func (r *PostgresSongQueryRepository) GetByID(id ulid.ULID, query application.SongByIDQuery) (application.SongDetails, error) {

	sql := buildSongByIDQuery(id, query)
	queryString, args, err := sql.ToSql()
	if err != nil {
		return application.SongDetails{}, err
	}

	rows, err := r.db.Query(
		queryString, args...,
	)
	if err != nil {
		return application.SongDetails{}, err
	}
	defer rows.Close()

	result := application.SongDetails{}
	first := true

	for rows.Next() {
		var dbRow dbSongDetailRow

		err := rows.Scan(
			&dbRow.Song.ID,
			&dbRow.Song.Title,
			&dbRow.Song.ArchivedAt,
			&dbRow.SongVersion.ID,
			&dbRow.SongVersion.PublishedAt,
			&dbRow.Score.ID,
			&dbRow.Score.FileID,
			&dbRow.Part.ID,
			&dbRow.Part.Key,
			&dbRow.Part.Name,
			&dbRow.Part.FileID,
		)
		if err != nil {
			return application.SongDetails{}, err
		}

		song, part, err := dbRow.toApplication()
		if err != nil {
			return application.SongDetails{}, err
		}

		if first {
			result = song
			first = false
		}
		if song.CurrentVersionID != nil && part.ID != (ulid.ULID{}) {
			version := result.Versions[*song.CurrentVersionID]
			version.Parts = append(version.Parts, part)
		}

	}

	if err := rows.Err(); err != nil {
		return application.SongDetails{}, err
	}

	if first {
		return application.SongDetails{}, application.ErrSongNotFound
	}

	return result, nil
}

// Base builder for SQL queries
var psql = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

// SQL string that left joins the current version through a select subquery
const joinCurrentVersion = `
LEFT JOIN song_versions sv ON sv.id = (
	SELECT sv2.id
	FROM song_versions sv2
	WHERE sv2.song_id = s.id
	  AND sv2.published_at IS NOT NULL
	ORDER BY sv2.published_at DESC
	LIMIT 1
)
`

func buildSongDetailsQuery(query application.SongQuery) sq.SelectBuilder {

	sql := psql.
		Select(
			"s.id",
			"s.title",
			"s.archived_at",
			"sv.id",
			"sv.published_at",
		).
		From("songs s").
		JoinClause(joinCurrentVersion)

	sql = addScoreColumns(sql, query.IncludeScore)

	sql = sql.
		Columns(
			"part.id",
			"part.key",
			"part.name",
			"part.file_id",
		)

	if len(query.Parts) > 0 {
		sql = sql.JoinClause(
			sq.Expr(
				"LEFT JOIN parts part ON part.song_version_id = sv.id AND ?",
				sq.Eq{"part.key": query.Parts},
			),
		)
	} else {
		sql = sql.LeftJoin(
			"parts part ON part.song_version_id = sv.id",
		)
	}

	if query.Archived {
		sql = sql.Where("s.archived_at IS NOT NULL")
	} else {
		sql = sql.Where("s.archived_at IS NULL")
	}

	sql = sql.
		OrderBy("s.id")

	return sql
}

func buildSongByIDQuery(id ulid.ULID, query application.SongByIDQuery) sq.SelectBuilder {

	sql := psql.
		Select(
			"s.id",
			"s.title",
			"s.archived_at",
			"sv.id",
			"sv.published_at",
		).
		From("songs s").
		JoinClause(joinCurrentVersion)

	sql = addScoreColumns(sql, query.IncludeScore)

	sql = sql.
		Columns(
			"part.id",
			"part.key",
			"part.name",
			"part.file_id",
		)

	sql = sql.LeftJoin(
		"parts part ON part.song_version_id = sv.id",
	)

	sql = sql.Where(sq.Eq{"s.id": id})

	sql = sql.
		OrderBy("s.id")

	return sql
}

func addScoreColumns(sql sq.SelectBuilder, includeScore bool) sq.SelectBuilder {
	if includeScore {
		return sql.
			Columns(
				"score.id",
				"score.file_id",
			).
			LeftJoin(
				"scores score ON score.song_version_id = sv.id",
			)
	} else {
		return sql.
			Columns(
				"NULL AS score_id",
				"NULL AS score_file_id",
			)
	}
}
