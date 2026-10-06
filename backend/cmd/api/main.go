package main

import (
	"log"
	"net/http"
	"os"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	httpHandler "github.com/erikdsp/notbibliotek/backend/internal/http"

	"github.com/erikdsp/notbibliotek/backend/internal/infrastructure/drivefilestorage"
	"github.com/erikdsp/notbibliotek/backend/internal/infrastructure/postgres"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	allowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		log.Fatal("CORS_ALLOWED_ORIGIN is not set")
	}

	db, err := postgres.Open(dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Wiring
	songRepository := postgres.NewPostgresSongRepository(db)
	songQueryRepository := postgres.NewPostgresSongQueryRepository(db)
	fileRepository := postgres.NewPostgresFileRepository(db)
	scoreRepository := postgres.NewPostgresScoreRepository(db)
	partRepository := postgres.NewPostgresPartRepository(db)
	songVersionRepository := postgres.NewPostgresSongVersionRepository(db)
	instrumentRepository := postgres.NewPostgresInstrumentRepository(db)
	partInstrumentRepository := postgres.NewPostgresPartInstrumentRepository(db)
	concertRepository := postgres.NewPostgresConcertRepository(db)
	concertSongRepository := postgres.NewPostgresConcertSongRepository(db)

	credentialsPath := os.Getenv("GOOGLE_DRIVE_CREDENTIALS_PATH")
	tokenPath := os.Getenv("GOOGLE_DRIVE_TOKEN_PATH")
	folderID := os.Getenv("GOOGLE_DRIVE_FOLDER_ID")
	driveRepository := drivefilestorage.NewPostgresDriveRepository(db)
	fileStorage, err := drivefilestorage.NewDriveFileStorage(credentialsPath, tokenPath, folderID, driveRepository)
	if err != nil {
		log.Fatal(err)
	}

	songService := application.NewSongService(songRepository, songQueryRepository)
	songVersionService := application.NewSongVersionService(songVersionRepository,
		songRepository, fileRepository, scoreRepository, partRepository, partInstrumentRepository, fileStorage)
	fileService := application.NewFileService(fileRepository, fileStorage)
	instrumentService := application.NewInstrumentService(instrumentRepository)
	concertService := application.NewConcertService(concertRepository, concertSongRepository)

	songHandler := httpHandler.NewSongHandler(songService)
	songVersionHandler := httpHandler.NewSongVersionHandler(songVersionService)
	fileHandler := httpHandler.NewFileHandler(fileService)
	instrumentHandler := httpHandler.NewInstrumentHandler(instrumentService)
	concertHandler := httpHandler.NewConcertHandler(concertService)

	router := httpHandler.NewRouter(
		songHandler,
		songVersionHandler,
		fileHandler,
		instrumentHandler,
		concertHandler,
	)

	corsHandler := httpHandler.CORSMiddleware(allowedOrigin, router)

	log.Fatal(http.ListenAndServe(":8080", corsHandler))

}
