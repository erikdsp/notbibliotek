package http

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
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

	responses := toConcertResponses(concerts)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
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

func (h *ConcertHandler) GetByID(w http.ResponseWriter, r *http.Request) {

	concertID, err := ulid.Parse(r.PathValue("concert_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	concert, err := h.service.GetConcertByID(concertID)
	if err != nil {
		log.Printf("GetConcertByID failed: %v", err)
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	response := toConcertResponse(concert)

	w.Header().Set("Content-Type", "application/json")
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
		log.Printf("DeleteConcert failed: %v", err)
		if errors.Is(err, application.ErrConcertNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)

}
