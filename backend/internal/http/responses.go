package http

import (
	"time"

	"github.com/oklog/ulid/v2"
)

type SongResponse struct {
	ID         ulid.ULID  `json:"id"`
	Title      string     `json:"title"`
	ArchivedAt *time.Time `json:"archived_at"`
}

type SongVersionResponse struct {
	ID          ulid.ULID  `json:"id"`
	SongID      ulid.ULID  `json:"song_id"`
	PublishedAt *time.Time `json:"published_at"`
}

type FileResponse struct {
	ID   ulid.ULID `json:"id"`
	Name string    `json:"name"`
}

type ScoreResponse struct {
	ID            ulid.ULID `json:"id"`
	SongVersionID ulid.ULID `json:"song_version_id"`
	FileID        ulid.ULID `json:"file_id"`
}

type PartResponse struct {
	ID            ulid.ULID `json:"id"`
	Key           string    `json:"key"`
	Name          string    `json:"name"`
	SongVersionID ulid.ULID `json:"song_version_id"`
	FileID        ulid.ULID `json:"file_id"`
}

type ScoreForVersion struct {
	ID     ulid.ULID `json:"id"`
	FileID ulid.ULID `json:"file_id"`
}

type PartForVersion struct {
	ID     ulid.ULID `json:"id"`
	Key    string    `json:"key"`
	Name   string    `json:"name"`
	FileID ulid.ULID `json:"file_id"`
}

type VersionResponse struct {
	SongVersionID ulid.ULID        `json:"song_version_id"`
	PublishedAt   *time.Time       `json:"published_at"`
	Score         ScoreForVersion  `json:"score"`
	Parts         []PartForVersion `json:"parts"`
}

type SongDetailedResponse struct {
	ID               ulid.ULID         `json:"id"`
	Title            string            `json:"title"`
	ArchivedAt       *time.Time        `json:"archived_at"`
	CurrentVersionID *ulid.ULID        `json:"current_version_id"`
	Versions         []VersionResponse `json:"versions"`
}

type InstrumentResponse struct {
	ID   ulid.ULID `json:"id"`
	Key  string    `json:"key"`
	Name string    `json:"name"`
}

type ConcertResponse struct {
	ID   ulid.ULID `json:"id"`
	Key  string    `json:"key"`
	Name string    `json:"name"`
	Date time.Time `json:"date"`
}
