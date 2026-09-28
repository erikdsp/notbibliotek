package http

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/erikdsp/notbibliotek/backend/internal/application"

	"github.com/oklog/ulid/v2"
)

type InstrumentHandler struct {
	service *application.InstrumentService
}

func NewInstrumentHandler(service *application.InstrumentService) *InstrumentHandler {
	return &InstrumentHandler{
		service: service,
	}
}

func (h *InstrumentHandler) GetAll(w http.ResponseWriter, r *http.Request) {

	instruments, err := h.service.GetAllInstruments()
	if err != nil {
		log.Printf("GetAllInstruments failed: %v", err)
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	responses := toInstrumentResponses(instruments)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

func (h *InstrumentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request CreateInstrumentRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	instrument, err := h.service.CreateInstrument(request.Key, request.Name)
	if err != nil {
		log.Printf("CreateInstrument failed: %v", err)
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	response := toInstrumentResponse(instrument)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *InstrumentHandler) Update(w http.ResponseWriter, r *http.Request) {
	var request UpdateInstrumentRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	instrumentID, err := ulid.Parse(r.PathValue("instrument_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	instrument, err := h.service.UpdateInstrument(
		instrumentID,
		request.Key,
		request.Name,
	)
	if err != nil {
		log.Printf("UpdateInstrument failed: %v", err)
		if errors.Is(err, application.ErrInstrumentNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	response := toInstrumentResponse(instrument)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *InstrumentHandler) Delete(w http.ResponseWriter, r *http.Request) {

	instrumentID, err := ulid.Parse(r.PathValue("instrument_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	err = h.service.DeleteInstrument(
		instrumentID,
	)
	if err != nil {
		log.Printf("DeleteInstrument failed: %v", err)
		if errors.Is(err, application.ErrInstrumentNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)

}

func (h *InstrumentHandler) CreatePartInstrumentConnection(w http.ResponseWriter, r *http.Request) {

	partID, err := ulid.Parse(r.PathValue("part_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	instrumentID, err := ulid.Parse(r.PathValue("instrument_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	created, err := h.service.CreateConnection(partID, instrumentID)
	if err != nil {
		log.Printf("CreateConnection failed: %v", err)
		if errors.Is(err, application.ErrResourceNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	if created {
		w.WriteHeader(http.StatusCreated)
	} else {
		w.WriteHeader(http.StatusNoContent)
	}

}

func (h *InstrumentHandler) DeletePartInstrumentConnection(w http.ResponseWriter, r *http.Request) {

	partID, err := ulid.Parse(r.PathValue("part_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	instrumentID, err := ulid.Parse(r.PathValue("instrument_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	err = h.service.DeleteConnection(partID, instrumentID)
	if err != nil {
		log.Printf("DeleteConnection failed for part %s and instrument %s: %v", partID, instrumentID, err)

		if errors.Is(err, application.ErrResourceNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)

}
