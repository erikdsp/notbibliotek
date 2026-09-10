package http

import (
	"net/http"
)

func NewRouter(songHandler *SongHandler, songVersionHandler *SongVersionHandler) *http.ServeMux {
	mux := http.NewServeMux()

	// Songs
	mux.HandleFunc("GET /api/v1/songs", songHandler.GetAll)
	mux.HandleFunc("POST /api/v1/songs", songHandler.Create)
	mux.HandleFunc("GET /api/v1/songs/{song_id}", songHandler.GetByID)
	mux.HandleFunc("PATCH /api/v1/songs/{song_id}", songHandler.Update)

	// Song Versions
	mux.HandleFunc("POST /api/v1/songs/{song_id}/versions", songVersionHandler.Create)
	mux.HandleFunc("POST /api/v1/songs/{song_id}/versions/{version_id}/score", songVersionHandler.UploadScore)
	mux.HandleFunc("PUT /api/v1/songs/{song_id}/versions/{version_id}/score", songVersionHandler.UpdateScore)
	return mux
}
