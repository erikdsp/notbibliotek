package postgres

import (
	"database/sql"
	"errors"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"

	"github.com/jackc/pgx/v5/pgconn"
)

const insertPartInstrumentQuery = `
	INSERT INTO part_instruments (part_id, instrument_id)
	VALUES ($1, $2)
	ON CONFLICT (part_id, instrument_id) DO NOTHING
`

const deletePartInstrumentQuery = `
    DELETE FROM part_instruments
    WHERE part_id = $1
	  AND instrument_id = $2
`

type PostgresPartInstrumentRepository struct {
	db *sql.DB
}

func NewPostgresPartInstrumentRepository(db *sql.DB) *PostgresPartInstrumentRepository {
	return &PostgresPartInstrumentRepository{
		db: db,
	}
}

func (r *PostgresPartInstrumentRepository) Create(partID ulid.ULID, instrumentID ulid.ULID) error {

	result, err := r.db.Exec(
		insertPartInstrumentQuery,
		uuid.UUID(partID),
		uuid.UUID(instrumentID),
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

func (r *PostgresPartInstrumentRepository) Delete(partID ulid.ULID, instrumentID ulid.ULID) error {
	result, err := r.db.Exec(
		deletePartInstrumentQuery,
		uuid.UUID(partID),
		uuid.UUID(instrumentID),
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
