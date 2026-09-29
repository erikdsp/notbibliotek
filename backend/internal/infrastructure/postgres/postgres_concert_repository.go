package postgres

import (
	"database/sql"
	"errors"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	sq "github.com/Masterminds/squirrel"
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

func buildConcertDetailsQuery() sq.SelectBuilder {
	return psql.
		Select(
			"c.id",
			"c.key",
			"c.name",
			"c.date",
			"s.id",
			"s.title",
			"s.archived_at",
		).
		From("concerts c").
		LeftJoin("concert_songs cs ON cs.concert_id = c.id").
		LeftJoin("songs s ON s.id = cs.song_id").
		OrderBy("c.date", "c.key")
}

type PostgresConcertRepository struct {
	db *sql.DB
}

type dbConcert struct {
	ID   uuid.UUID
	Key  string
	Name string
	Date time.Time
}

type dbNullableSong struct {
	ID         uuid.NullUUID
	Title      sql.NullString
	ArchivedAt sql.NullTime
}

type dbConcertDetailedRow struct {
	ID   uuid.UUID
	Key  string
	Name string
	Date time.Time
	Song dbNullableSong
}

func (c dbConcert) toDomain() domain.Concert {
	return domain.Concert{
		ID:   ulid.ULID(c.ID),
		Key:  c.Key,
		Name: c.Name,
		Date: c.Date,
	}
}

func (c dbConcertDetailedRow) toDomain() (domain.Concert, domain.Song) {

	concert := domain.Concert{
		ID:   ulid.ULID(c.ID),
		Key:  c.Key,
		Name: c.Name,
		Date: c.Date,
	}

	if !c.Song.ID.Valid || !c.Song.Title.Valid {
		return concert, domain.Song{}
	}

	song := domain.Song{
		ID:    ulid.ULID(c.Song.ID.UUID),
		Title: c.Song.Title.String,
	}

	if c.Song.ArchivedAt.Valid {
		song.ArchivedAt = &c.Song.ArchivedAt.Time
	}

	return concert, song
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

func (r *PostgresConcertRepository) GetAllWithDetails() ([]application.ConcertDetails, error) {

	sql := buildConcertDetailsQuery()

	queryString, args, err := sql.ToSql()
	if err != nil {
		return nil, err
	}

	rows, err := r.db.Query(queryString, args...)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	concerts := make(map[ulid.ULID]*application.ConcertDetails)
	var concertOrder []ulid.ULID
	var prevConcertID *ulid.ULID

	for rows.Next() {
		var dbConcertRow dbConcertDetailedRow

		err := rows.Scan(
			&dbConcertRow.ID,
			&dbConcertRow.Key,
			&dbConcertRow.Name,
			&dbConcertRow.Date,
			&dbConcertRow.Song.ID,
			&dbConcertRow.Song.Title,
			&dbConcertRow.Song.ArchivedAt,
		)
		if err != nil {
			return nil, err
		}

		concert, song := dbConcertRow.toDomain()
		currentConcertID := concert.ID

		if prevConcertID == nil || currentConcertID != *prevConcertID {
			concerts[currentConcertID] = &application.ConcertDetails{
				Concert: concert,
			}
			concertOrder = append(concertOrder, currentConcertID)
			prevConcertID = &currentConcertID
		}
		if song.ID != (ulid.ULID{}) {
			concerts[currentConcertID].Songs = append(concerts[currentConcertID].Songs, song)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	result := make([]application.ConcertDetails, 0, len(concertOrder))
	for _, id := range concertOrder {
		result = append(result, *concerts[id])
	}

	return result, nil
}

func (r *PostgresConcertRepository) GetByIDWithDetails(id ulid.ULID) (application.ConcertDetails, error) {
	return application.ConcertDetails{}, nil
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
