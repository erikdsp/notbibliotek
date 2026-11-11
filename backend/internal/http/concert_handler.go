package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/application"

	"github.com/oklog/ulid/v2"
)

type ConcertHandler struct {
	service *application.ConcertService
}

func NewConcertHandler(service *application.ConcertService) *ConcertHandler {
	return &ConcertHandler{
		service: service,
	}
}

func (h *ConcertHandler) GetAll(w http.ResponseWriter, r *http.Request) {

	concerts, err := h.service.GetAllConcerts()
	if err != nil {
		log.Printf("GetAllConcerts failed: %v", err)
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	responses := toConcertDetailedResponses(concerts)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

func (h *ConcertHandler) GetByID(w http.ResponseWriter, r *http.Request) {

	concertID, err := ulid.Parse(r.PathValue("concert_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	concert, err := h.service.GetConcertByID(concertID)
	if err != nil {
		log.Printf("GetConcertByID failed: %v", err)
		if errors.Is(err, application.ErrConcertNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	response := toConcertDetailedResponse(concert)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ConcertHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request CreateConcertRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		log.Printf("Concert Decoding failed: %v", err)
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	date, err := time.Parse(time.DateOnly, request.Date)
	if err != nil {
		writeError(w, "invalid date", http.StatusBadRequest)
		return
	}

	concert, err := h.service.CreateConcert(request.Key, request.Name, date)
	if err != nil {
		log.Printf("CreateConcert failed: %v", err)
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	response := toConcertResponse(concert)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *ConcertHandler) Update(w http.ResponseWriter, r *http.Request) {

	concertID, err := ulid.Parse(r.PathValue("concert_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	var request UpdateConcertRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	var date *time.Time

	if request.Date != nil {
		dateRequest, err := time.Parse(time.DateOnly, *request.Date)
		if err != nil {
			writeError(w, "invalid date", http.StatusBadRequest)
			return
		}
		date = &dateRequest
	}

	concert, err := h.service.UpdateConcert(
		concertID,
		request.Key,
		request.Name,
		date,
	)
	if err != nil {
		log.Printf("UpdateConcert failed: %v", err)
		if errors.Is(err, application.ErrConcertNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	response := toConcertResponse(concert)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *ConcertHandler) Delete(w http.ResponseWriter, r *http.Request) {

	concertID, err := ulid.Parse(r.PathValue("concert_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	err = h.service.DeleteConcert(
		concertID,
	)
	if err != nil {
		log.Printf("DeleteConcert failed for concert %s : %v", concertID, err)
		if errors.Is(err, application.ErrConcertNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)

}

func (h *ConcertHandler) CreateConcertSongConnection(w http.ResponseWriter, r *http.Request) {

	concertID, err := ulid.Parse(r.PathValue("concert_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	songID, err := ulid.Parse(r.PathValue("song_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	err = h.service.CreateConnection(concertID, songID)
	if err != nil {
		log.Printf("CreateConnection failed for concert %s and song %s: %v", concertID, songID, err)
		if errors.Is(err, application.ErrResourceNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}
		if errors.Is(err, application.ErrConflictingOperation) {
			writeError(w, err.Error(), http.StatusConflict)
			return
		}
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)

}

func (h *ConcertHandler) DeleteConcertSongConnection(w http.ResponseWriter, r *http.Request) {

	concertID, err := ulid.Parse(r.PathValue("concert_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	songID, err := ulid.Parse(r.PathValue("song_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	err = h.service.DeleteConnection(concertID, songID)
	if err != nil {
		log.Printf("DeleteConnection failed for concert %s and song %s: %v", concertID, songID, err)

		if errors.Is(err, application.ErrResourceNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)

}

func (h *ConcertHandler) DownloadConcert(w http.ResponseWriter, r *http.Request) {

	concertID, err := ulid.Parse(r.PathValue("concert_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	query, err := parseDownloadConcertQuery(r.URL.RawQuery)
	if err != nil {
		log.Printf("parseDownloadConcertQuery failed: %v", err)
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	response, fileDownloadErrors, err := h.service.DownloadConcert(concertID, query)

	for _, downloadError := range fileDownloadErrors {
		log.Printf(
			"ConcertHandler.DownloadConcert: failed to download file %s: %v",
			downloadError.FileID,
			downloadError.Err,
		)
	}

	if err != nil {
		switch {
		case errors.Is(err, application.ErrInvalidOperation):
			writeError(w, err.Error(), http.StatusBadRequest)

		case errors.Is(err, application.ErrConcertNotFound),
			errors.Is(err, application.ErrInstrumentNotFound),
			errors.Is(err, application.ErrNoFilesAvailable):
			writeError(w, err.Error(), http.StatusNotFound)

		default:
			log.Printf("ConcertHandler.DownloadConcert failed: %v", err)
			writeError(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}

	defer response.File.Close()

	setDownloadFileName(w, response.FileName)
	w.Header().Set("Content-Type", "application/zip")

	_, err = io.Copy(w, response.File)
	if err != nil {
		log.Printf("ConcertHandler.DownloadConcert Copy failed: %v", err)
		return
	}

}

func parseDownloadConcertQuery(rawQuery string) (application.DownloadConcertQuery, error) {
	queryValues, err := url.ParseQuery(rawQuery)
	if err != nil {
		return application.DownloadConcertQuery{}, err
	}

	query := application.DownloadConcertQuery{
		Instruments: queryValues["instrument"],
	}

	if includeUnconnectedParts := queryValues.Get("include_unconnected_parts"); includeUnconnectedParts != "" {
		queryValue, err := strconv.ParseBool(includeUnconnectedParts)
		if err != nil {
			return application.DownloadConcertQuery{}, fmt.Errorf("invalid include_unconnected_parts: %w", err)
		}
		query.IncludeUnconnectedParts = queryValue
	}

	return query, nil
}
