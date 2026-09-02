package main

import (
	"fmt"
	"log"
	"os"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/erikdsp/notbibliotek/backend/internal/infrastructure/postgres"
	"github.com/joho/godotenv"
	"github.com/oklog/ulid/v2"
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

	song := domain.Song{
		ID:    ulid.Make(),
		Title: "Test Song",
	}

	if err := songRepository.Create(song); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Song created:", song.ID)

	testSong, err := songRepository.GetByID(song.ID)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Song fetched from database:", testSong.ID)

	songs, err := songRepository.GetAll()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("All songs fetched from database:")
	for _, song := range songs {
		fmt.Println(song.ID, song.Title)
	}

}
