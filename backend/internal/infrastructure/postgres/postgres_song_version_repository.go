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
`

const getSongVersionByIDQuery = `
	SELECT id, song_id, published_at
	FROM song_versions
	WHERE id = $1
`

type PostgresSongVersionRepository struct {
	db *sql.DB
}

type dbSongVersion struct {
	ID          uuid.UUID
	SongID      uuid.UUID
	PublishedAt *time.Time
}

func (s dbSongVersion) toDomain() domain.SongVersion {
	return domain.SongVersion{
		ID:          ulid.ULID(s.ID),
		SongID:      ulid.ULID(s.SongID),
		PublishedAt: s.PublishedAt,
	}
}

func NewPostgresSongVersionRepository(db *sql.DB) *PostgresSongVersionRepository {
	return &PostgresSongVersionRepository{
		db: db,
	}
}

func (r *PostgresSongVersionRepository) Create(songVersion domain.SongVersion) error {

	_, err := r.db.Exec(
		insertSongVersionQuery,
		uuid.UUID(songVersion.ID),
		uuid.UUID(songVersion.SongID),
	)

	return err
}

func (r *PostgresSongVersionRepository) GetByID(id ulid.ULID) (domain.SongVersion, error) {
	var dbSongVersion dbSongVersion

	err := r.db.QueryRow(
		getSongVersionByIDQuery,
		uuid.UUID(id),
	).Scan(
		&dbSongVersion.ID,
		&dbSongVersion.SongID,
		&dbSongVersion.PublishedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.SongVersion{}, application.ErrSongNotFound
		}

		return domain.SongVersion{}, err
	}

	return dbSongVersion.toDomain(), nil
}
