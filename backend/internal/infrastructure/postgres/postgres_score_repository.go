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
