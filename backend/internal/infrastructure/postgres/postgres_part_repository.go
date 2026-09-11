package postgres

import (
	"database/sql"
	"errors"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
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

const getPartBySongVersionIDAndKeyQuery = `
	SELECT id, key, name, song_version_id, file_id
	FROM parts
	WHERE song_version_id = $1
	AND key = $2
`

const updatePartQuery = `
    UPDATE parts
	SET file_id = $2,
	    name = $3
	WHERE id = $1
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

func (s dbPart) toDomain() domain.Part {
	return domain.Part{
		ID:            ulid.ULID(s.ID),
		Key:           s.Key,
		Name:          s.Name,
		SongVersionID: ulid.ULID(s.SongVersionID),
		FileID:        ulid.ULID(s.FileID),
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

func (r *PostgresPartRepository) GetBySongVersionIDAndKey(songVersionID ulid.ULID, key string) (domain.Part, error) {
	var dbPart dbPart

	err := r.db.QueryRow(
		getPartBySongVersionIDAndKeyQuery,
		uuid.UUID(songVersionID),
		key,
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

func (r *PostgresPartRepository) Update(part domain.Part) error {
	_, err := r.db.Exec(
		updatePartQuery,
		uuid.UUID(part.ID),
		uuid.UUID(part.FileID),
		part.Name,
	)

	return err

}
