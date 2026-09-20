package http

import (
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/erikdsp/notbibliotek/backend/internal/application"

	"github.com/oklog/ulid/v2"
)

type FileHandler struct {
	service *application.FileService
}

func NewFileHandler(service *application.FileService) *FileHandler {
	return &FileHandler{
		service: service,
	}
}

func (h *FileHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	fileID, err := ulid.Parse(r.PathValue("file_id"))
	if err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	response, err := h.service.GetFileByID(fileID)
	if err != nil {
		log.Printf("GetFileByID: %v", err)
		if errors.Is(err, application.ErrFileNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}

		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}
	defer response.File.Close()

	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, response.FileName))
	w.Header().Set("Content-Type", "application/pdf")

	_, err = io.Copy(w, response.File)
	if err != nil {
		return
	}
}
