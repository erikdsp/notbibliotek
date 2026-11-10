package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/utils/set"

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
		if errors.Is(err, application.ErrFileNotFound) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}

		log.Printf("FileHandler.GetByID failed: %v", err)
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}
	defer response.File.Close()

	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, response.FileName))
	w.Header().Set("Content-Type", "application/pdf")

	_, err = io.Copy(w, response.File)
	if err != nil {
		log.Printf("FileHandler.GetByID Copy failed: %v", err)
		return
	}
}

func generateDownloadFileName() string {
	return fmt.Sprintf(
		"DownloadedSheetMusic-%s.zip",
		time.Now().Format("20060102-1504"),
	)
}

func (h *FileHandler) DownloadFiles(w http.ResponseWriter, r *http.Request) {
	var request DownloadFilesRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, "bad request", http.StatusBadRequest)
		return
	}

	if len(request.Files) == 0 {
		writeError(w, "no files requested", http.StatusBadRequest)
		return
	}

	fileIDs := make([]ulid.ULID, 0, len(request.Files))
	uniqueFileIDs := set.NewSet[ulid.ULID]()

	for _, file := range request.Files {
		if file.FileID == (ulid.ULID{}) {
			writeError(w, "invalid file ID", http.StatusBadRequest)
			return
		}

		if uniqueFileIDs.Contains(file.FileID) {
			continue
		}

		uniqueFileIDs.Insert(file.FileID)
		fileIDs = append(fileIDs, file.FileID)
	}

	response, fileDownloadErrors, err := h.service.GetFilesAsZip(fileIDs, generateDownloadFileName())

	for _, downloadError := range fileDownloadErrors {
		log.Printf(
			"FileHandler.DownloadFiles: failed to download file %s: %v",
			downloadError.FileID,
			downloadError.Err,
		)
	}

	if err != nil {
		if errors.Is(err, application.ErrNoFilesAvailable) {
			writeError(w, err.Error(), http.StatusNotFound)
			return
		}

		log.Printf("FileHandler.DownloadFiles failed: %v", err)
		writeError(w, "internal server error", http.StatusInternalServerError)
		return
	}
	defer response.File.Close()

	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, response.FileName))
	w.Header().Set("Content-Type", "application/zip")

	_, err = io.Copy(w, response.File)
	if err != nil {
		log.Printf("FileHandler.DownloadFiles Copy failed: %v", err)
		return
	}
}
