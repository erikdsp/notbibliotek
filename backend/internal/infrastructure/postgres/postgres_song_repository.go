package postgres

import (
	"database/sql"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

const insertSongQuery = `
	INSERT INTO songs (id, title)
	VALUES ($1, $2)
`

const getSongByIDQuery = `
	SELECT id, title, archived_at
	FROM songs
	WHERE id = $1
`

const getAllSongsQuery = `
	SELECT id, title, archived_at
	FROM songs
	WHERE archived_at IS NULL
	ORDER BY title
`

const updateSongQuery = `
    UPDATE songs
	SET title = $2,
	    archived_at = $3
	WHERE id = $1
`

type PostgresSongRepository struct {
	db *sql.DB
}

type dbSong struct {
	ID         uuid.UUID
	Title      string
	ArchivedAt *time.Time
}

func (s dbSong) toDomain() domain.Song {
	return domain.Song{
		ID:         ulid.ULID(s.ID),
		Title:      s.Title,
		ArchivedAt: s.ArchivedAt,
	}
}

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
	var dbSong dbSong

	err := r.db.QueryRow(
		getSongByIDQuery,
		uuid.UUID(id),
	).Scan(
		&dbSong.ID,
		&dbSong.Title,
		&dbSong.ArchivedAt,
	)
	if err != nil {
		return domain.Song{}, err
	}

	return dbSong.toDomain(), nil
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
		var dbSong dbSong

		err := rows.Scan(
			&dbSong.ID,
			&dbSong.Title,
			&dbSong.ArchivedAt,
		)
		if err != nil {
			return nil, err
		}

		songs = append(songs, dbSong.toDomain())
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return songs, nil
}

func (r *PostgresSongRepository) Update(song domain.Song) error {
	_, err := r.db.Exec(
		updateSongQuery,
		uuid.UUID(song.ID),
		song.Title,
		song.ArchivedAt,
	)

	return err

}
