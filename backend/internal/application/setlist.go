package application

import (
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
)

type Setlist struct {
	ConcertName string
	ConcertDate time.Time
	ShowParts   bool
	Songs       []SetlistSong
}

type SetlistSong struct {
	Title       string
	Parts       []string
	PublishedAt *time.Time
}

type SetlistGenerator interface {
	Generate(setlist Setlist) ([]byte, error)
}

func createSetlist(
	concert domain.Concert,
	songs []SongDetails,
	showParts bool,
) Setlist {
	setlist := Setlist{
		ConcertName: concert.Name,
		ConcertDate: concert.Date,
		ShowParts:   showParts,
		Songs:       make([]SetlistSong, 0, len(songs)),
	}

	for _, song := range songs {
		setlistSong := SetlistSong{
			Title: song.Song.Title,
		}

		if song.CurrentVersionID != nil {
			currentVersion := getVersionByID(
				song.Versions,
				*song.CurrentVersionID,
			)

			if currentVersion != nil {
				setlistSong.PublishedAt = currentVersion.Version.PublishedAt

				if showParts {
					for _, part := range currentVersion.Parts {
						setlistSong.Parts = append(setlistSong.Parts, part.Name)
					}
				}
			}
		}

		setlist.Songs = append(setlist.Songs, setlistSong)
	}

	return setlist
}
