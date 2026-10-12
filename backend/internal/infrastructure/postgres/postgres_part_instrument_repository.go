package postgres

import (
	"database/sql"
	"errors"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
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

const getPartInstrumentsBySongVersionIDQuery = `
	SELECT pi.part_id, i.id, i.key, i.name
	FROM part_instruments pi
	JOIN instruments i ON i.id = pi.instrument_id
	JOIN parts p ON p.id = pi.part_id
	WHERE p.song_version_id = $1
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

func (r *PostgresPartInstrumentRepository) GetBySongVersionID(songVersionID ulid.ULID) ([]application.PartInstruments, error) {
	rows, err := r.db.Query(
		getPartInstrumentsBySongVersionIDQuery,
		uuid.UUID(songVersionID),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	instrumentMap := make(map[ulid.ULID][]domain.Instrument)

	for rows.Next() {
		var dbPartID uuid.UUID
		var dbInstrument dbInstrument

		err := rows.Scan(
			&dbPartID,
			&dbInstrument.ID,
			&dbInstrument.Key,
			&dbInstrument.Name,
		)
		if err != nil {
			return nil, err
		}

		partID := ulid.ULID(dbPartID)
		instrument := dbInstrument.toDomain()
		instrumentMap[partID] = append(instrumentMap[partID], instrument)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	result := make([]application.PartInstruments, 0, len(instrumentMap))

	for id, instruments := range instrumentMap {
		result = append(result, application.PartInstruments{
			PartID:      id,
			Instruments: instruments,
		})
	}

	return result, nil

}
