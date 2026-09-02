package http

import (
	"encoding/json"
	"net/http"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
)

type SongHandler struct {
	service *application.SongService
}

type CreateSongRequest struct {
	Title string `json:"title"`
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

func (h *SongHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request CreateSongRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	song, err := h.service.CreateSong(request.Title)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(song); err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}
