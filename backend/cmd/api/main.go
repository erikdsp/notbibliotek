package main

import (
	"log"
	"net/http"
	"os"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	httpHandler "github.com/erikdsp/notbibliotek/backend/internal/http"
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

	songRepository := postgres.NewPostgresSongRepository(db)
	songService := application.NewSongService(songRepository)
	songHandler := httpHandler.NewSongHandler(songService)
	router := httpHandler.NewRouter(songHandler)

	log.Fatal(http.ListenAndServe(":8080", router))

}
