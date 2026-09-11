package main

import (
	"log"
	"net/http"
	"os"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	httpHandler "github.com/erikdsp/notbibliotek/backend/internal/http"
	"github.com/erikdsp/notbibliotek/backend/internal/infrastructure/filestorage"
	"github.com/erikdsp/notbibliotek/backend/internal/infrastructure/postgres"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := os.Getenv("DATABASE_URL")

	db, err := postgres.Open(dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Wiring
	songRepository := postgres.NewPostgresSongRepository(db)
	songService := application.NewSongService(songRepository)
	songHandler := httpHandler.NewSongHandler(songService)

	fileRepository := postgres.NewPostgresFileRepository(db)
	scoreRepository := postgres.NewPostgresScoreRepository(db)
	partRepository := postgres.NewPostgresPartRepository(db)

	songVersionRepository := postgres.NewPostgresSongVersionRepository(db)
	fileStorage := filestorage.NewLocalFileStorage("./backend/data/files")

	songVersionService := application.NewSongVersionService(songVersionRepository,
		songRepository, fileRepository, scoreRepository, partRepository, fileStorage)
	songVersionHandler := httpHandler.NewSongVersionHandler(songVersionService)

	router := httpHandler.NewRouter(songHandler, songVersionHandler)

	log.Fatal(http.ListenAndServe(":8080", router))

}
