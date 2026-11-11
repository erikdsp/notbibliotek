package postgres

import (
	"database/sql"
	"errors"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

const insertFileQuery = `
	INSERT INTO files (id, name)
	VALUES ($1, $2)
`

const getFileByIDQuery = `
	SELECT id, name
	FROM files
	WHERE id = $1
`

const updateFileQuery = `
	UPDATE files
	SET name = $2
	WHERE id = $1
`
const deleteFileQuery = `
    DELETE FROM files
    WHERE id = $1
`

const deleteUnreferencedFileQuery = `
	DELETE FROM files f
	WHERE f.id = $1
  	  AND NOT EXISTS (
        SELECT 1 FROM scores s
        WHERE s.file_id = f.id
  	  )
      AND NOT EXISTS (
        SELECT 1 FROM parts p
        WHERE p.file_id = f.id
      )
`

type PostgresFileRepository struct {
	db *sql.DB
}

type dbFile struct {
	ID   uuid.UUID
	Name string
}

func (f dbFile) toDomain() domain.File {
	return domain.File{
		ID:   ulid.ULID(f.ID),
		Name: f.Name,
	}
}

func NewPostgresFileRepository(db *sql.DB) *PostgresFileRepository {
	return &PostgresFileRepository{
		db: db,
	}
}

func (r *PostgresFileRepository) Create(file domain.File) error {

	_, err := r.db.Exec(
		insertFileQuery,
		uuid.UUID(file.ID),
		file.Name,
	)

	return err
}

func (r *PostgresFileRepository) GetByID(id ulid.ULID) (domain.File, error) {
	var dbFile dbFile

	err := r.db.QueryRow(
		getFileByIDQuery,
		uuid.UUID(id),
	).Scan(
		&dbFile.ID,
		&dbFile.Name,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.File{}, application.ErrFileNotFound
		}

		return domain.File{}, err
	}

	return dbFile.toDomain(), nil
}

func (r *PostgresFileRepository) Update(file domain.File) error {

	_, err := r.db.Exec(
		updateFileQuery,
		uuid.UUID(file.ID),
		file.Name,
	)

	return err
}

func (r *PostgresFileRepository) Delete(id ulid.ULID) error {
	_, err := r.db.Exec(deleteFileQuery, uuid.UUID(id))
	return err
}

func (r *PostgresFileRepository) DeleteIfUnreferenced(id ulid.ULID) (deleted bool, err error) {
	result, err := r.db.Exec(deleteUnreferencedFileQuery, uuid.UUID(id))
	if err != nil {
		return false, err
	}

	affectedRows, err := result.RowsAffected()
	if err != nil {
		return false, err
	}

	return affectedRows > 0, nil

}
