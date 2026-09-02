package http

import (
	"net/http"
)

func NewRouter(songHandler *SongHandler) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/v1/songs", songHandler.GetAll)
	mux.HandleFunc("POST /api/v1/songs", songHandler.Create)

	return mux
}
