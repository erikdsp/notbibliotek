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

const insertConcertQuery = `
	INSERT INTO concerts (id, key, name, date)
	VALUES ($1, $2, $3, $4)
`

const getConcertByIDQuery = `
	SELECT id, key, name, date
	FROM concerts
	WHERE id = $1
`

const getAllConcertsQuery = `
	SELECT id, key, name, date
	FROM concerts
	ORDER BY date, key
`

const updateConcertQuery = `
    UPDATE concerts
	SET key = $2,
	    name = $3,
		date = $4
	WHERE id = $1
`

const deleteConcertQuery = `
    DELETE FROM concerts
    WHERE id = $1
`

type PostgresConcertRepository struct {
	db *sql.DB
}

type dbConcert struct {
	ID   uuid.UUID
	Key  string
	Name string
	Date time.Time
}

func (c dbConcert) toDomain() domain.Concert {
	return domain.Concert{
		ID:   ulid.ULID(c.ID),
		Key:  c.Key,
		Name: c.Name,
		Date: c.Date,
	}
}

func NewPostgresConcertRepository(db *sql.DB) *PostgresConcertRepository {
	return &PostgresConcertRepository{
		db: db,
	}
}

func (r *PostgresConcertRepository) Create(concert domain.Concert) error {

	_, err := r.db.Exec(
		insertConcertQuery,
		uuid.UUID(concert.ID),
		concert.Key,
		concert.Name,
		concert.Date,
	)

	return err
}

func (r *PostgresConcertRepository) GetByID(id ulid.ULID) (domain.Concert, error) {
	var dbConcert dbConcert

	err := r.db.QueryRow(
		getConcertByIDQuery,
		uuid.UUID(id),
	).Scan(
		&dbConcert.ID,
		&dbConcert.Key,
		&dbConcert.Name,
		&dbConcert.Date,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Concert{}, application.ErrConcertNotFound
		}

		return domain.Concert{}, err
	}

	return dbConcert.toDomain(), nil
}

func (r *PostgresConcertRepository) GetAll() ([]domain.Concert, error) {

	rows, err := r.db.Query(
		getAllConcertsQuery,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	concerts := []domain.Concert{}

	for rows.Next() {
		var dbConcert dbConcert

		err := rows.Scan(
			&dbConcert.ID,
			&dbConcert.Key,
			&dbConcert.Name,
			&dbConcert.Date,
		)
		if err != nil {
			return nil, err
		}

		concerts = append(concerts, dbConcert.toDomain())
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return concerts, nil
}

func (r *PostgresConcertRepository) Update(concert domain.Concert) error {
	result, err := r.db.Exec(
		updateConcertQuery,
		uuid.UUID(concert.ID),
		concert.Key,
		concert.Name,
		concert.Date,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return application.ErrConcertNotFound
	}

	return nil
}

func (r *PostgresConcertRepository) Delete(id ulid.ULID) error {
	result, err := r.db.Exec(
		deleteConcertQuery,
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
		return application.ErrConcertNotFound
	}

	return nil
}
