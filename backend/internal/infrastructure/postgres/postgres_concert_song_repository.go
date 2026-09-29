package postgres

import (
	"database/sql"
	"errors"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"

	"github.com/jackc/pgx/v5/pgconn"
)

const insertConcertSongQuery = `
	INSERT INTO concert_songs (concert_id, song_id)
	VALUES ($1, $2)
	ON CONFLICT (concert_id, song_id) DO NOTHING
`

const deleteConcertSongQuery = `
    DELETE FROM concert_songs
    WHERE concert_id = $1
	  AND song_id = $2
`

type PostgresConcertSongRepository struct {
	db *sql.DB
}

func NewPostgresConcertSongRepository(db *sql.DB) *PostgresConcertSongRepository {
	return &PostgresConcertSongRepository{
		db: db,
	}
}

func (r *PostgresConcertSongRepository) Create(concertID ulid.ULID, songID ulid.ULID) error {

	result, err := r.db.Exec(
		insertConcertSongQuery,
		uuid.UUID(concertID),
		uuid.UUID(songID),
	)

	if err != nil {
		var pgErr *pgconn.PgError

		if errors.As(err, &pgErr) && pgErr.Code == ErrForeignKeyViolation {
			return application.ErrResourceNotFound
		}
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return application.ErrConflictingOperation
	}

	return nil
}

func (r *PostgresConcertSongRepository) Delete(concertID ulid.ULID, songID ulid.ULID) error {
	result, err := r.db.Exec(
		deleteConcertSongQuery,
		uuid.UUID(concertID),
		uuid.UUID(songID),
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
