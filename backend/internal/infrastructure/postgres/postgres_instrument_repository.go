package postgres

import (
	"database/sql"
	"errors"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

const insertInstrumentQuery = `
	INSERT INTO instruments (id, key, name)
	VALUES ($1, $2, $3)
`

const getInstrumentByIDQuery = `
	SELECT id, key, name
	FROM instruments
	WHERE id = $1
`

const getAllInstrumentsQuery = `
	SELECT id, key, name
	FROM instruments
	ORDER BY key
`

const updateInstrumentQuery = `
    UPDATE instruments
	SET key = $2,
	    name = $3
	WHERE id = $1
`

const deleteInstrumentQuery = `
    DELETE FROM instruments
    WHERE id = $1
`

type PostgresInstrumentRepository struct {
	db *sql.DB
}

type dbInstrument struct {
	ID   uuid.UUID
	Key  string
	Name string
}

func (i dbInstrument) toDomain() domain.Instrument {
	return domain.Instrument{
		ID:   ulid.ULID(i.ID),
		Key:  i.Key,
		Name: i.Name,
	}
}

func NewPostgresInstrumentRepository(db *sql.DB) *PostgresInstrumentRepository {
	return &PostgresInstrumentRepository{
		db: db,
	}
}

func (r *PostgresInstrumentRepository) Create(instrument domain.Instrument) error {

	_, err := r.db.Exec(
		insertInstrumentQuery,
		uuid.UUID(instrument.ID),
		instrument.Key,
		instrument.Name,
	)

	return err
}

func (r *PostgresInstrumentRepository) GetByID(id ulid.ULID) (domain.Instrument, error) {
	var dbInstrument dbInstrument

	err := r.db.QueryRow(
		getInstrumentByIDQuery,
		uuid.UUID(id),
	).Scan(
		&dbInstrument.ID,
		&dbInstrument.Key,
		&dbInstrument.Name,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Instrument{}, application.ErrInstrumentNotFound
		}

		return domain.Instrument{}, err
	}

	return dbInstrument.toDomain(), nil
}

func (r *PostgresInstrumentRepository) GetAll() ([]domain.Instrument, error) {

	rows, err := r.db.Query(
		getAllInstrumentsQuery,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	instruments := []domain.Instrument{}

	for rows.Next() {
		var dbInstrument dbInstrument

		err := rows.Scan(
			&dbInstrument.ID,
			&dbInstrument.Key,
			&dbInstrument.Name,
		)
		if err != nil {
			return nil, err
		}

		instruments = append(instruments, dbInstrument.toDomain())
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return instruments, nil
}

func (r *PostgresInstrumentRepository) Update(instrument domain.Instrument) error {
	result, err := r.db.Exec(
		updateInstrumentQuery,
		uuid.UUID(instrument.ID),
		instrument.Key,
		instrument.Name,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return application.ErrInstrumentNotFound
	}

	return nil
}

func (r *PostgresInstrumentRepository) Delete(id ulid.ULID) error {
	result, err := r.db.Exec(
		deleteInstrumentQuery,
		uuid.UUID(id),
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return application.ErrInstrumentNotFound
	}

	return nil
}
