package postgres

import (
	"database/sql"
	"errors"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

const insertScoreQuery = `
	INSERT INTO scores (id, song_version_id, file_id)
	VALUES ($1, $2, $3)
`

const getScoreByIDQuery = `
	SELECT id, song_version_id, file_id
	FROM scores
	WHERE id = $1
`

const getScoreBySongVersionIDQuery = `
	SELECT id, song_version_id, file_id
	FROM scores
	WHERE song_version_id = $1
`

const updateScoreQuery = `
    UPDATE scores
	SET file_id = $2
	WHERE id = $1
`

const selectAndLockSongVersionQuery = `
	SELECT published_at
	FROM song_versions
	WHERE id = $1
	  AND song_id = $2
	FOR UPDATE;
`

const deleteScoreQuery = `
	DELETE FROM scores
	WHERE song_version_id = $1
	RETURNING file_id;
`

type PostgresScoreRepository struct {
	db *sql.DB
}

type dbScore struct {
	ID            uuid.UUID
	SongVersionID uuid.UUID
	FileID        uuid.UUID
}

func (s dbScore) toDomain() domain.Score {
	return domain.Score{
		ID:            ulid.ULID(s.ID),
		SongVersionID: ulid.ULID(s.SongVersionID),
		FileID:        ulid.ULID(s.FileID),
	}
}

func NewPostgresScoreRepository(db *sql.DB) *PostgresScoreRepository {
	return &PostgresScoreRepository{
		db: db,
	}
}

func (r *PostgresScoreRepository) Create(score domain.Score) error {

	_, err := r.db.Exec(
		insertScoreQuery,
		uuid.UUID(score.ID),
		uuid.UUID(score.SongVersionID),
		uuid.UUID(score.FileID),
	)

	return err
}

func (r *PostgresScoreRepository) GetByID(id ulid.ULID) (domain.Score, error) {
	var dbScore dbScore

	err := r.db.QueryRow(
		getScoreByIDQuery,
		uuid.UUID(id),
	).Scan(
		&dbScore.ID,
		&dbScore.SongVersionID,
		&dbScore.FileID,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Score{}, application.ErrScoreNotFound
		}

		return domain.Score{}, err
	}

	return dbScore.toDomain(), nil
}

func (r *PostgresScoreRepository) GetBySongVersionID(songVersionID ulid.ULID) (domain.Score, error) {
	var dbScore dbScore

	err := r.db.QueryRow(
		getScoreBySongVersionIDQuery,
		uuid.UUID(songVersionID),
	).Scan(
		&dbScore.ID,
		&dbScore.SongVersionID,
		&dbScore.FileID,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Score{}, application.ErrScoreNotFound
		}

		return domain.Score{}, err
	}

	return dbScore.toDomain(), nil
}

func (r *PostgresScoreRepository) Update(score domain.Score) error {
	_, err := r.db.Exec(
		updateScoreQuery,
		uuid.UUID(score.ID),
		uuid.UUID(score.FileID),
	)

	return err

}

func (r *PostgresScoreRepository) Delete(songID ulid.ULID, songVersionID ulid.ULID) (ulid.ULID, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return ulid.ULID{}, err
	}
	defer tx.Rollback()

	var publishedAt sql.NullTime

	err = tx.QueryRow(
		selectAndLockSongVersionQuery,
		uuid.UUID(songVersionID),
		uuid.UUID(songID),
	).Scan(&publishedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ulid.ULID{}, application.ErrSongVersionNotFound
		}
		return ulid.ULID{}, err
	}

	if publishedAt.Valid {
		return ulid.ULID{}, application.ErrSongVersionAlreadyPublished
	}

	var dbFileID uuid.UUID

	err = tx.QueryRow(
		deleteScoreQuery,
		uuid.UUID(songVersionID),
	).Scan(&dbFileID)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ulid.ULID{}, application.ErrScoreNotFound
		}
		return ulid.ULID{}, err
	}

	if err := tx.Commit(); err != nil {
		return ulid.ULID{}, err
	}

	return ulid.ULID(dbFileID), nil
}
