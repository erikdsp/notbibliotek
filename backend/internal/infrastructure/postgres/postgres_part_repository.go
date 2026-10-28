package postgres

import (
	"database/sql"
	"errors"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"

	"github.com/jackc/pgx/v5/pgconn"
)

const insertPartQuery = `
	INSERT INTO parts (id, key, name, song_version_id, file_id)
	VALUES ($1, $2, $3, $4, $5)
`

const getPartByIDQuery = `
	SELECT id, key, name, song_version_id, file_id
	FROM parts
	WHERE id = $1
`

const getPartsBySongVersionIDQuery = `
	SELECT id, key, name, song_version_id, file_id
	FROM parts
	WHERE song_version_id = $1
`

const updatePartQuery = `
    UPDATE parts
	SET file_id = $2,
	    name = $3,
		key = $4
	WHERE id = $1
`

const selectAndLockSongVersionByPartIdQuery = `
	SELECT sv.published_at
	FROM song_versions sv
	JOIN parts p ON p.song_version_id = sv.id
	WHERE p.id = $1
	FOR UPDATE OF sv;
`

const deletePartQuery = `
	DELETE FROM parts
	WHERE id = $1
	RETURNING file_id;
`

type PostgresPartRepository struct {
	db *sql.DB
}

type dbPart struct {
	ID            uuid.UUID
	Key           string
	Name          string
	SongVersionID uuid.UUID
	FileID        uuid.UUID
}

func (p dbPart) toDomain() domain.Part {
	return domain.Part{
		ID:            ulid.ULID(p.ID),
		Key:           p.Key,
		Name:          p.Name,
		SongVersionID: ulid.ULID(p.SongVersionID),
		FileID:        ulid.ULID(p.FileID),
	}
}

func NewPostgresPartRepository(db *sql.DB) *PostgresPartRepository {
	return &PostgresPartRepository{
		db: db,
	}
}

func (r *PostgresPartRepository) Create(part domain.Part) error {

	_, err := r.db.Exec(
		insertPartQuery,
		uuid.UUID(part.ID),
		part.Key,
		part.Name,
		uuid.UUID(part.SongVersionID),
		uuid.UUID(part.FileID),
	)

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == ErrUniqueViolation {
		return application.ErrConflictingOperation
	}
	return err

}

func (r *PostgresPartRepository) GetByID(id ulid.ULID) (domain.Part, error) {
	var dbPart dbPart

	err := r.db.QueryRow(
		getPartByIDQuery,
		uuid.UUID(id),
	).Scan(
		&dbPart.ID,
		&dbPart.Key,
		&dbPart.Name,
		&dbPart.SongVersionID,
		&dbPart.FileID,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Part{}, application.ErrPartNotFound
		}

		return domain.Part{}, err
	}

	return dbPart.toDomain(), nil
}

func (r *PostgresPartRepository) GetBySongVersionID(songVersionID ulid.ULID) ([]domain.Part, error) {
	parts := []domain.Part{}

	rows, err := r.db.Query(
		getPartsBySongVersionIDQuery,
		uuid.UUID(songVersionID),
	)
	if err != nil {
		return []domain.Part{}, err
	}
	defer rows.Close()

	for rows.Next() {
		var dbPart dbPart

		if err := rows.Scan(
			&dbPart.ID,
			&dbPart.Key,
			&dbPart.Name,
			&dbPart.SongVersionID,
			&dbPart.FileID,
		); err != nil {
			return []domain.Part{}, err
		}

		parts = append(parts, dbPart.toDomain())
	}

	if err := rows.Err(); err != nil {
		return []domain.Part{}, err
	}

	return parts, nil
}

func (r *PostgresPartRepository) Update(part domain.Part) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var publishedAt sql.NullTime

	err = tx.QueryRow(
		selectAndLockSongVersionByPartIdQuery, uuid.UUID(part.ID)).Scan(&publishedAt)

	if errors.Is(err, sql.ErrNoRows) {
		return application.ErrPartNotFound
	}
	if err != nil {
		return err
	}

	if publishedAt.Valid {
		return application.ErrSongVersionAlreadyPublished
	}

	_, err = tx.Exec(
		updatePartQuery,
		uuid.UUID(part.ID),
		uuid.UUID(part.FileID),
		part.Name,
		part.Key,
	)

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == ErrUniqueViolation {
		return application.ErrConflictingOperation
	}

	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *PostgresPartRepository) Delete(partID ulid.ULID) (ulid.ULID, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return ulid.ULID{}, err
	}
	defer tx.Rollback()

	var publishedAt sql.NullTime

	err = tx.QueryRow(
		selectAndLockSongVersionByPartIdQuery,
		uuid.UUID(partID),
	).Scan(&publishedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ulid.ULID{}, application.ErrPartNotFound
		}
		return ulid.ULID{}, err
	}

	if publishedAt.Valid {
		return ulid.ULID{}, application.ErrSongVersionAlreadyPublished
	}

	var dbFileID uuid.UUID

	err = tx.QueryRow(
		deletePartQuery,
		uuid.UUID(partID),
	).Scan(&dbFileID)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ulid.ULID{}, application.ErrPartNotFound
		}
		return ulid.ULID{}, err
	}

	if err := tx.Commit(); err != nil {
		return ulid.ULID{}, err
	}

	return ulid.ULID(dbFileID), nil

}
