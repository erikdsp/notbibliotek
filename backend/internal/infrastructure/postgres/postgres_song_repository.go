package postgres

import (
	"database/sql"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

type PostgresSongRepository struct {
	db *sql.DB
}

const insertSongQuery = `
	INSERT INTO songs (id, title)
	VALUES ($1, $2)
`

const getSongByIDQuery = `
	SELECT id, title
	FROM songs
	WHERE id = $1
`

const getAllSongsQuery = `
	SELECT id, title
	FROM songs
	WHERE archived_at IS NULL
	ORDER BY title
`

func NewPostgresSongRepository(db *sql.DB) *PostgresSongRepository {
	return &PostgresSongRepository{
		db: db,
	}
}

func (r *PostgresSongRepository) Create(song domain.Song) error {

	_, err := r.db.Exec(
		insertSongQuery,
		uuid.UUID(song.ID),
		song.Title,
	)

	return err
}

func (r *PostgresSongRepository) GetByID(id ulid.ULID) (domain.Song, error) {
	var song domain.Song
	var dbID uuid.UUID

	err := r.db.QueryRow(
		getSongByIDQuery,
		uuid.UUID(id),
	).Scan(
		&dbID,
		&song.Title,
	)
	if err != nil {
		return song, err
	}
	song.ID = ulid.ULID(dbID)

	return song, nil
}

func (r *PostgresSongRepository) GetAll() ([]domain.Song, error) {
	rows, err := r.db.Query(
		getAllSongsQuery,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var songs []domain.Song

	for rows.Next() {
		var song domain.Song
		var dbID uuid.UUID

		err := rows.Scan(
			&dbID,
			&song.Title,
		)
		if err != nil {
			return nil, err
		}

		song.ID = ulid.ULID(dbID)
		songs = append(songs, song)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return songs, nil
}
