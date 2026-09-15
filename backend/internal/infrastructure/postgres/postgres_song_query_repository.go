package postgres

import (
	"database/sql"
	// "errors"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
)

type PostgresSongQueryRepository struct {
	db *sql.DB
}

type dbSongResponse struct {
	ID            uuid.UUID
	SongVersionID uuid.UUID
	FileID        uuid.UUID
}

func (s dbSongResponse) toDomain() application.SongDetails {
	return application.SongDetails{
		Song: domain.Song{
			ID: ulid.ULID(s.ID),
		},
		CurrentVersionID: nil,
		Versions:         []application.VersionDetails{},
	}
}

func NewPostgresSongQueryRepository(db *sql.DB) *PostgresSongQueryRepository {
	return &PostgresSongQueryRepository{
		db: db,
	}
}

func (r *PostgresSongQueryRepository) GetAll(query application.SongQuery) ([]application.SongDetails, error) {
	return []application.SongDetails{dbSongResponse{}.toDomain()}, nil
}
