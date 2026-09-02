package http

import (
	"encoding/json"
	"net/http"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
)

type SongHandler struct {
	service *application.SongService
}

func NewSongHandler(service *application.SongService) *SongHandler {
	return &SongHandler{
		service: service,
	}
}

func (h *SongHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	songs, err := h.service.GetAllSongs()
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(songs); err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

}
