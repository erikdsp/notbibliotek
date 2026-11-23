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
	CreatedAt   *time.Time
}

type dbScoreDetail struct {
	ID       uuid.NullUUID
	FileID   uuid.NullUUID
	FileName sql.NullString
}

type dbPartDetail struct {
	ID       uuid.NullUUID
	Key      sql.NullString
	Name     sql.NullString
	FileID   uuid.NullUUID
	FileName sql.NullString
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
			Versions:         []application.VersionDetails{},
		}, application.PartDetails{}, nil
	}

	songVersionID := ulid.ULID(s.SongVersion.ID.UUID)

	var score *application.ScoreDetails

	if s.Score.ID.Valid != s.Score.FileID.Valid ||
		s.Score.ID.Valid != s.Score.FileName.Valid {
		return application.SongDetails{},
			application.PartDetails{},
			application.ErrIncompleteScore
	}

	if s.Score.ID.Valid {
		score = &application.ScoreDetails{
			ID: ulid.ULID(s.Score.ID.UUID),
			File: domain.File{
				ID:   ulid.ULID(s.Score.FileID.UUID),
				Name: s.Score.FileName.String,
			},
		}
	}

	songDetails := application.SongDetails{
		Song: domain.Song{
			ID:         songID,
			Title:      s.Song.Title,
			ArchivedAt: s.Song.ArchivedAt,
		},
		CurrentVersionID: nil,
		Versions: []application.VersionDetails{
			{
				Version: application.SongVersionDetails{
					ID:          songVersionID,
					PublishedAt: s.SongVersion.PublishedAt,
					CreatedAt:   *s.SongVersion.CreatedAt,
				},
				Score: score,
			},
		},
	}

	if !s.Part.ID.Valid {
		return songDetails, application.PartDetails{}, nil
	}

	if !s.Part.FileID.Valid || !s.Part.Key.Valid || !s.Part.Name.Valid || !s.Part.FileName.Valid {
		return songDetails, application.PartDetails{}, application.ErrIncompletePart
	}

	partDetails := application.PartDetails{
		ID:   ulid.ULID(s.Part.ID.UUID),
		Key:  s.Part.Key.String,
		Name: s.Part.Name.String,
		File: domain.File{
			ID:   ulid.ULID(s.Part.FileID.UUID),
			Name: s.Part.FileName.String,
		},
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
			&dbRow.SongVersion.CreatedAt,
			&dbRow.Score.ID,
			&dbRow.Score.FileID,
			&dbRow.Score.FileName,
			&dbRow.Part.ID,
			&dbRow.Part.Key,
			&dbRow.Part.Name,
			&dbRow.Part.FileID,
			&dbRow.Part.FileName,
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

			if dbRow.SongVersion.ID.Valid {
				versionID := ulid.ULID(dbRow.SongVersion.ID.UUID)
				song.CurrentVersionID = &versionID
			}

			songs[currentSongID] = &song
			songOrder = append(songOrder, currentSongID)
			prevSongID = &currentSongID
		}
		if dbRow.SongVersion.ID.Valid && part.ID != (ulid.ULID{}) {
			version := &songs[currentSongID].Versions[0]
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
	firstRow := true

	for rows.Next() {
		var dbRow dbSongDetailRow

		err := rows.Scan(
			&dbRow.Song.ID,
			&dbRow.Song.Title,
			&dbRow.Song.ArchivedAt,
			&dbRow.SongVersion.ID,
			&dbRow.SongVersion.PublishedAt,
			&dbRow.SongVersion.CreatedAt,
			&dbRow.Score.ID,
			&dbRow.Score.FileID,
			&dbRow.Score.FileName,
			&dbRow.Part.ID,
			&dbRow.Part.Key,
			&dbRow.Part.Name,
			&dbRow.Part.FileID,
			&dbRow.Part.FileName,
		)
		if err != nil {
			return application.SongDetails{}, err
		}

		song, part, err := dbRow.toApplication()
		if err != nil {
			return application.SongDetails{}, err
		}

		if firstRow {
			result = song
			firstRow = false
		}

		rowHasSongVersion := dbRow.SongVersion.ID.Valid
		if rowHasSongVersion {
			versionID := ulid.ULID(dbRow.SongVersion.ID.UUID)

			isFirstPublishedVersionEncountered := result.CurrentVersionID == nil &&
				dbRow.SongVersion.PublishedAt != nil
			if isFirstPublishedVersionEncountered {
				result.CurrentVersionID = &versionID
			}

			previousVersion := &result.Versions[len(result.Versions)-1]
			rowIsNewSongVersion := previousVersion.Version.ID != versionID

			if rowIsNewSongVersion {
				versionInCurrentRow := song.Versions[0]
				result.Versions = append(result.Versions, versionInCurrentRow)
			}

			rowHasPart := part.ID != (ulid.ULID{})
			if rowHasPart {
				currentVersion := &result.Versions[len(result.Versions)-1]
				currentVersion.Parts = append(currentVersion.Parts, part)

			}

		}
	}

	if err := rows.Err(); err != nil {
		return application.SongDetails{}, err
	}

	if firstRow {
		return application.SongDetails{}, application.ErrSongNotFound
	}

	return result, nil
}

var postgresBaseBuilder = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

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

	sql := postgresBaseBuilder.
		Select(
			"s.id",
			"s.title",
			"s.archived_at",
			"sv.id",
			"sv.published_at",
			"sv.created_at",
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
			"part_file.name",
		)

	sql = addJoinParts(sql, query.Parts, query.Instruments, query.IncludeUnconnectedParts)

	if !query.IncludeArchived {
		sql = sql.Where("s.archived_at IS NULL")
	}

	if len(query.Concerts) > 0 {
		sql = sql.Where(songMatchesConcertCondition(query.Concerts))
	}

	sql = sql.
		OrderBy(
			"s.title ASC",
			"s.id",
			"part_file.name ASC",
		)

	return sql
}

func buildSongByIDQuery(id ulid.ULID, query application.SongByIDQuery) sq.SelectBuilder {

	sql := postgresBaseBuilder.
		Select(
			"s.id",
			"s.title",
			"s.archived_at",
			"sv.id",
			"sv.published_at",
			"sv.created_at",
		).
		From("songs s").
		LeftJoin("song_versions sv ON sv.song_id = s.id").
		OrderBy(
			"sv.published_at DESC NULLS LAST",
			"sv.created_at DESC",
			"sv.id",
			"part_file.name ASC",
		)

	sql = addScoreColumns(sql, query.IncludeScore)

	sql = sql.
		Columns(
			"part.id",
			"part.key",
			"part.name",
			"part.file_id",
			"part_file.name",
		)

	sql = addJoinParts(sql, query.Parts, query.Instruments, query.IncludeUnconnectedParts)

	sql = sql.Where(sq.Eq{"s.id": id})

	return sql
}

func addScoreColumns(sql sq.SelectBuilder, includeScore bool) sq.SelectBuilder {
	if includeScore {
		return sql.
			Columns(
				"score.id",
				"score.file_id",
				"score_file.name",
			).
			LeftJoin(
				"scores score ON score.song_version_id = sv.id",
			).
			LeftJoin(
				"files score_file ON score_file.id = score.file_id",
			)
	} else {
		return sql.
			Columns(
				"NULL AS score_id",
				"NULL AS score_file_id",
				"NULL AS score_file_name",
			)
	}
}

func addJoinParts(sql sq.SelectBuilder, parts []string, instruments []string, includeUnassignedParts bool) sq.SelectBuilder {

	conditions := sq.Or{}

	if len(parts) > 0 {
		conditions = append(conditions, sq.Eq{"part.key": parts})
	}

	if len(instruments) > 0 {
		conditions = append(conditions, partMatchesInstrumentCondition(instruments))
	}

	if includeUnassignedParts {
		conditions = append(conditions, noInstrumentCondition())
	}

	if len(conditions) == 0 {
		sql = sql.LeftJoin("parts part ON part.song_version_id = sv.id")
	} else {
		sql = sql.JoinClause(
			sq.Expr(
				"LEFT JOIN parts part ON part.song_version_id = sv.id AND ?",
				conditions,
			),
		)
	}

	return sql.LeftJoin("files part_file ON part_file.id = part.file_id")
}

func partMatchesInstrumentCondition(instruments []string) sq.Sqlizer {
	return sq.Expr(`
		EXISTS (
			SELECT 1
			FROM part_instruments pi
			JOIN instruments i ON i.id = pi.instrument_id
			WHERE pi.part_id = part.id
			  AND ?
		)
	`, sq.Eq{"i.key": instruments})
}

func noInstrumentCondition() sq.Sqlizer {
	return sq.Expr(`
            NOT EXISTS (
                SELECT 1
                FROM part_instruments pi
                WHERE pi.part_id = part.id
            )
        `)
}

func songMatchesConcertCondition(concerts []string) sq.Sqlizer {
	return sq.Expr(`
			EXISTS (
				SELECT 1
				FROM concert_songs cs
				JOIN concerts c ON c.id = cs.concert_id
				WHERE cs.song_id = s.id
				  AND ?
			)
		`, sq.Eq{"c.key": concerts})
}
