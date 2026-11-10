package http

import (
	"github.com/oklog/ulid/v2"
)

type CreateSongRequest struct {
	Title string `json:"title"`
}

type UpdateSongRequest struct {
	Title    *string `json:"title"`
	Archived *bool   `json:"archived"`
}

type CreateInstrumentRequest struct {
	Key  string `json:"key"`
	Name string `json:"name"`
}

type UpdateInstrumentRequest struct {
	Key  *string `json:"key"`
	Name *string `json:"name"`
}

type CreateConcertRequest struct {
	Key  string `json:"key"`
	Name string `json:"name"`
	Date string `json:"date"`
}

type UpdateConcertRequest struct {
	Key  *string `json:"key"`
	Name *string `json:"name"`
	Date *string `json:"date"`
}

type DownloadFilesRequest struct {
	Files []struct {
		FileID ulid.ULID `json:"file_id"`
	} `json:"files"`
}

// type FileIDRequest struct {
// 	FileID ulid.ULID `json:"file_id"`
// }

// type DownloadFilesRequest struct {
// 	Files []FileIDRequest `json:"files"`
// }
