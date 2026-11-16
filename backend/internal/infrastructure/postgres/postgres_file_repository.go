package postgres

import (
	"database/sql"
	"errors"
	"time"

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

const getLatestPublishedAtQuery = `
	SELECT MAX(sv.published_at)
	FROM song_versions sv
	WHERE sv.published_at IS NOT NULL
	AND (
		EXISTS (
		SELECT 1
		FROM parts p
		WHERE p.song_version_id = sv.id
			AND p.file_id = ANY($1)
		)
		OR EXISTS (
		SELECT 1
		FROM scores s
		WHERE s.song_version_id = sv.id
			AND s.file_id = ANY($1)
		)
	);
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

func (r *PostgresFileRepository) GetByID(fileID ulid.ULID) (domain.File, error) {
	var dbFile dbFile

	err := r.db.QueryRow(
		getFileByIDQuery,
		uuid.UUID(fileID),
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

func (r *PostgresFileRepository) DeleteIfUnreferenced(fileID ulid.ULID) (deleted bool, err error) {
	result, err := r.db.Exec(deleteUnreferencedFileQuery, uuid.UUID(fileID))
	if err != nil {
		return false, err
	}

	affectedRows, err := result.RowsAffected()
	if err != nil {
		return false, err
	}

	return affectedRows > 0, nil

}

func (r *PostgresFileRepository) GetLatestPublishedAt(fileIDs []ulid.ULID) (*time.Time, error) {
	var latestPublishedAt *time.Time
	dbFileIDs := make([]uuid.UUID, len(fileIDs))

	for i, fileID := range fileIDs {
		dbFileIDs[i] = uuid.UUID(fileID)
	}

	err := r.db.QueryRow(
		getLatestPublishedAtQuery,
		dbFileIDs,
	).Scan(
		&latestPublishedAt,
	)
	if err != nil {
		return nil, err
	}

	return latestPublishedAt, nil
}
