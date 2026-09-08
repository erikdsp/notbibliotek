package http

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/erikdsp/notbibliotek/backend/internal/application"

	"github.com/oklog/ulid/v2"
)

const maxUploadFileSize int64 = 10 << 20

type SongVersionHandler struct {
	service *application.SongVersionService
}

func NewSongVersionHandler(service *application.SongVersionService) *SongVersionHandler {
	return &SongVersionHandler{
		service: service,
	}
}

func (h *SongVersionHandler) Create(w http.ResponseWriter, r *http.Request) {
	songID, err := ulid.Parse(r.PathValue("song_id"))
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	songVersion, err := h.service.CreateSongVersion(songID)
	if err != nil {
		if errors.Is(err, application.ErrSongNotFound) {
			http.Error(w, "song not found", http.StatusNotFound)
			return
		}

		http.Error(w, "internal server error", http.StatusInternalServerError)
		return

	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(songVersion)
}

func (h *SongVersionHandler) UploadScore(w http.ResponseWriter, r *http.Request) {
	songID, err := ulid.Parse(r.PathValue("song_id"))
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	versionID, err := ulid.Parse(r.PathValue("version_id"))
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxUploadFileSize)
	err = r.ParseMultipartForm(maxUploadFileSize)
	if err != nil {
		http.Error(w, "parse error", http.StatusBadRequest)
		return
	}

	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "missing file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	scoreResponse, err := h.service.UploadScore(songID, versionID, fileHeader.Filename, file)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(scoreResponse)

}
