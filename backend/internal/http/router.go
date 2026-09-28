package http

import (
	"io/fs"
	"net/http"

	"github.com/erikdsp/notbibliotek/docs"
)

func NewRouter(
	songHandler *SongHandler,
	songVersionHandler *SongVersionHandler,
	fileHandler *FileHandler,
	instrumentHandler *InstrumentHandler,
) *http.ServeMux {

	mux := http.NewServeMux()

	// openAPI specification
	mux.HandleFunc("/openapi.yaml", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, docs.Files, "openapi.yaml")
	})

	// Swagger UI
	swaggerFS, err := fs.Sub(docs.Files, "swagger-ui")
	if err != nil {
		panic(err)
	}
	mux.Handle(
		"/docs/",
		http.StripPrefix("/docs/", http.FileServer(http.FS(swaggerFS))))

	// Songs
	mux.HandleFunc("GET /api/v1/songs", songHandler.GetAll)
	mux.HandleFunc("POST /api/v1/songs", songHandler.Create)
	mux.HandleFunc("GET /api/v1/songs/{song_id}", songHandler.GetByID)
	mux.HandleFunc("PATCH /api/v1/songs/{song_id}", songHandler.Update)

	// Downloads
	mux.HandleFunc("GET /api/v1/files/{file_id}/download", fileHandler.GetByID)

	// Song Versions
	mux.HandleFunc("POST /api/v1/songs/{song_id}/versions", songVersionHandler.Create)
	mux.HandleFunc("POST /api/v1/songs/{song_id}/versions/{version_id}/score", songVersionHandler.UploadScore)
	mux.HandleFunc("PUT /api/v1/songs/{song_id}/versions/{version_id}/score", songVersionHandler.UpdateScore)
	mux.HandleFunc("POST /api/v1/songs/{song_id}/versions/{version_id}/part/{key}", songVersionHandler.UploadPart)
	mux.HandleFunc("PUT /api/v1/songs/{song_id}/versions/{version_id}/part/{key}", songVersionHandler.UpdatePart)
	mux.HandleFunc("POST /api/v1/songs/{song_id}/versions/{version_id}/publish", songVersionHandler.Publish)

	// Instruments
	mux.HandleFunc("GET /api/v1/instruments", instrumentHandler.GetAll)
	mux.HandleFunc("POST /api/v1/instruments", instrumentHandler.Create)
	mux.HandleFunc("PATCH /api/v1/instruments/{instrument_id}", instrumentHandler.Update)
	mux.HandleFunc("DELETE /api/v1/instruments/{instrument_id}", instrumentHandler.Delete)
	mux.HandleFunc("PUT /api/v1/parts/{part_id}/instruments/{instrument_id}", instrumentHandler.CreatePartInstrumentConnection)
	mux.HandleFunc("DELETE /api/v1/parts/{part_id}/instruments/{instrument_id}", instrumentHandler.DeletePartInstrumentConnection)

	return mux
}
