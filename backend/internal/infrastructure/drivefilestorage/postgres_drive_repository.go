package drivefilestorage

import (
	"database/sql"
	"errors"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

const insertStorageIDQuery = `
	INSERT INTO file_storage_ids (file_id, storage_id)
	VALUES ($1, $2)
`

const getStorageIDQuery = `
	SELECT storage_id
	FROM file_storage_ids
	WHERE file_id = $1
`

const deleteStorageIDQuery = `
	DELETE FROM file_storage_ids
	WHERE file_id = $1
`

type PostgresDriveRepository struct {
	db *sql.DB
}

type dbDriveStorage struct {
	StorageID string
}

func NewPostgresDriveRepository(db *sql.DB) *PostgresDriveRepository {
	return &PostgresDriveRepository{
		db: db,
	}
}

func (r *PostgresDriveRepository) SaveID(fileID ulid.ULID, driveFileID string) error {
	_, err := r.db.Exec(
		insertStorageIDQuery,
		uuid.UUID(fileID),
		driveFileID,
	)

	return err

}

func (r *PostgresDriveRepository) GetID(fileID ulid.ULID) (string, error) {
	var dbStorage dbDriveStorage

	err := r.db.QueryRow(
		getStorageIDQuery,
		uuid.UUID(fileID),
	).Scan(
		&dbStorage.StorageID,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", application.ErrResourceNotFound
		}

		return "", err
	}

	return dbStorage.StorageID, nil

}

func (r *PostgresDriveRepository) DeleteID(fileID ulid.ULID) error {
	result, err := r.db.Exec(
		deleteStorageIDQuery,
		uuid.UUID(fileID),
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return application.ErrResourceNotFound
	}

	return nil
}
