package http

import (
	"net/http"
)

func NewRouter(songHandler *SongHandler, songVersionHandler *SongVersionHandler, fileHandler *FileHandler) *http.ServeMux {
	mux := http.NewServeMux()

	// Songs
	mux.HandleFunc("GET /api/v1/songs", songHandler.GetAll)
	mux.HandleFunc("POST /api/v1/songs", songHandler.Create)
	mux.HandleFunc("GET /api/v1/songs/{song_id}", songHandler.GetByID)
	mux.HandleFunc("PATCH /api/v1/songs/{song_id}", songHandler.Update)

	// Downloads
	mux.HandleFunc("GET /api/v1/files/{file_id}/download", fileHandler.GetByID)

	// Song Versions
	mux.HandleFunc("POST /api/v1/songs/{song_id}/versions", songVersionHandler.Create)
	mux.HandleFunc("POST /api/v1/songs/{song_id}/versions/{version_id}/score", songVersionHandler.UploadScore)
	mux.HandleFunc("PUT /api/v1/songs/{song_id}/versions/{version_id}/score", songVersionHandler.UpdateScore)
	mux.HandleFunc("POST /api/v1/songs/{song_id}/versions/{version_id}/part/{key}", songVersionHandler.UploadPart)
	mux.HandleFunc("PUT /api/v1/songs/{song_id}/versions/{version_id}/part/{key}", songVersionHandler.UpdatePart)
	mux.HandleFunc("POST /api/v1/songs/{song_id}/versions/{version_id}/publish", songVersionHandler.Publish)
	return mux
}
