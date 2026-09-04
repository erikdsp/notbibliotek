package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/erikdsp/notbibliotek/backend/internal/application"

	"github.com/oklog/ulid/v2"
)

type SongHandler struct {
	service *application.SongService
}

type CreateSongRequest struct {
	Title string `json:"title"`
}

type UpdateSongRequest struct {
	Title    *string `json:"title"`
	Archived *bool   `json:"archived"`
}

func NewSongHandler(service *application.SongService) *SongHandler {
	return &SongHandler{
		service: service,
	}
}

func parseGetAllQuery(rawQuery string) (application.SongQuery, error) {
	queryValues, err := url.ParseQuery(rawQuery)
	if err != nil {
		return application.SongQuery{}, err
	}

	query := application.SongQuery{
		Search:     queryValues.Get("search"),
		Concert:    queryValues.Get("concert"),
		Part:       queryValues.Get("part"),
		Instrument: queryValues.Get("instrument"),
	}

	if archived := queryValues.Get("archived"); archived != "" {
		queryValue, err := strconv.ParseBool(archived)
		if err != nil {
			return application.SongQuery{}, fmt.Errorf("invalid archived: %w", err)
		}
		query.Archived = queryValue
	}

	if includeScore := queryValues.Get("include_score"); includeScore != "" {
		queryValue, err := strconv.ParseBool(includeScore)
		if err != nil {
			return application.SongQuery{}, fmt.Errorf("invalid include_score: %w", err)
		}

		query.IncludeScore = queryValue
	} else {
		query.IncludeScore = true
	}

	return query, nil
}

func (h *SongHandler) GetAll(w http.ResponseWriter, r *http.Request) {

	query, err := parseGetAllQuery(r.URL.RawQuery)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	fmt.Println("Query instrument: ", query.Instrument)

	songs, err := h.service.GetAllSongsWithQuery(query)
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

func (h *SongHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	songID, err := ulid.Parse(r.PathValue("song_id"))
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	song, err := h.service.GetSongByID(songID)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(song); err != nil {
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

func (h *SongHandler) Update(w http.ResponseWriter, r *http.Request) {
	var request UpdateSongRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	songID, err := ulid.Parse(r.PathValue("song_id"))
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	song, err := h.service.UpdateSong(
		songID,
		request.Title,
		request.Archived,
	)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(song); err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}
