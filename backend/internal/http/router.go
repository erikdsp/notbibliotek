package http

import (
	"net/http"
)

func NewRouter(songHandler *SongHandler) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/v1/songs", songHandler.GetAll)
	mux.HandleFunc("POST /api/v1/songs", songHandler.Create)
	mux.HandleFunc("GET /api/v1/songs/{song_id}", songHandler.GetByID)
	mux.HandleFunc("PATCH /api/v1/songs/{song_id}", songHandler.Update)

	return mux
}
