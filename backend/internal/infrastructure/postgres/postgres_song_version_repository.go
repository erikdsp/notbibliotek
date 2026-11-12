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

const insertSongVersionQuery = `
	INSERT INTO song_versions (id, song_id)
	VALUES ($1, $2)
	RETURNING created_at
`

const getSongVersionByIDQuery = `
	SELECT id, song_id, published_at, created_at
	FROM song_versions
	WHERE id = $1
`

const updateSongVersionQuery = `
    UPDATE song_versions
	SET published_at = $2
	WHERE id = $1
	  AND published_at IS NULL
`

const selectAndLockSongVersionBySongAndVersionIDQuery = `
	SELECT published_at
	FROM song_versions
	WHERE id = $1
	  AND song_id = $2
	FOR UPDATE;
`

const selectAndLockSongVersionByVersionIDQuery = `
    SELECT published_at
    FROM song_versions
    WHERE id = $1
    FOR UPDATE
`

const deleteSongVersionQuery = `
    DELETE FROM song_versions
    WHERE id = $1
`

type PostgresSongVersionRepository struct {
	db *sql.DB
}

type dbSongVersion struct {
	ID          uuid.UUID
	SongID      uuid.UUID
	PublishedAt *time.Time
	CreatedAt   time.Time
}

func (s dbSongVersion) toDomain() domain.SongVersion {
	return domain.SongVersion{
		ID:          ulid.ULID(s.ID),
		SongID:      ulid.ULID(s.SongID),
		PublishedAt: s.PublishedAt,
		CreatedAt:   s.CreatedAt,
	}
}

func NewPostgresSongVersionRepository(db *sql.DB) *PostgresSongVersionRepository {
	return &PostgresSongVersionRepository{
		db: db,
	}
}

func (r *PostgresSongVersionRepository) Create(songVersionID ulid.ULID, songID ulid.ULID) (domain.SongVersion, error) {
	var createdAt time.Time

	err := r.db.QueryRow(
		insertSongVersionQuery,
		uuid.UUID(songVersionID),
		uuid.UUID(songID),
	).Scan(&createdAt)

	if err != nil {
		return domain.SongVersion{}, err
	}

	return domain.SongVersion{
		ID:          songVersionID,
		SongID:      songID,
		PublishedAt: nil,
		CreatedAt:   createdAt,
	}, nil
}

func (r *PostgresSongVersionRepository) GetByID(songVersionID ulid.ULID) (domain.SongVersion, error) {
	var dbSongVersion dbSongVersion

	err := r.db.QueryRow(
		getSongVersionByIDQuery,
		uuid.UUID(songVersionID),
	).Scan(
		&dbSongVersion.ID,
		&dbSongVersion.SongID,
		&dbSongVersion.PublishedAt,
		&dbSongVersion.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.SongVersion{}, application.ErrSongVersionNotFound
		}

		return domain.SongVersion{}, err
	}

	return dbSongVersion.toDomain(), nil
}

func (r *PostgresSongVersionRepository) Publish(songVersion domain.SongVersion) error {
	result, err := r.db.Exec(
		updateSongVersionQuery,
		uuid.UUID(songVersion.ID),
		songVersion.PublishedAt,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return application.ErrNoRowsAffected
	}

	return nil

}

func (r *PostgresSongVersionRepository) Delete(songVersionID ulid.ULID) error {

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var publishedAt sql.NullTime

	err = tx.QueryRow(
		selectAndLockSongVersionByVersionIDQuery,
		uuid.UUID(songVersionID),
	).Scan(&publishedAt)

	if errors.Is(err, sql.ErrNoRows) {
		return application.ErrSongVersionNotFound
	}
	if err != nil {
		return err
	}

	if publishedAt.Valid {
		return application.ErrSongVersionAlreadyPublished
	}

	_, err = tx.Exec(
		deleteSongVersionQuery,
		uuid.UUID(songVersionID),
	)
	if err != nil {
		return err
	}

	return tx.Commit()

}
