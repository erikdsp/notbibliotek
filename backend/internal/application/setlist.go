package application

import (
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
)

type Setlist struct {
	Title     string
	Subtitle  string
	ShowParts bool
	Songs     []SetlistSong
}

type SetlistSong struct {
	Title       string
	Parts       []string
	PublishedAt *time.Time
}

type SetlistGenerator interface {
	Generate(setlist Setlist) (pdfData []byte, err error)
}

func createSetlist(
	concert *domain.Concert,
	songs []SongDetails,
	showParts bool,
) Setlist {
	title, subtitle := getSetlistHeader(concert, songs)

	setlist := Setlist{
		Title:     title,
		Subtitle:  subtitle,
		ShowParts: showParts,
		Songs:     make([]SetlistSong, 0, len(songs)),
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

func getSetlistHeader(
	concert *domain.Concert,
	songs []SongDetails,
) (title string, subtitle string) {
	if concert != nil {
		return concert.Name, concert.Date.Format("2 Jan 2006")
	}

	title = "All Songs in the Library"

	var lastUpdated *time.Time

	for _, song := range songs {
		if song.CurrentVersionID == nil {
			continue
		}

		version := getVersionByID(song.Versions, *song.CurrentVersionID)
		if version == nil || version.Version.PublishedAt == nil {
			continue
		}

		publishedAt := version.Version.PublishedAt

		if lastUpdated == nil || publishedAt.After(*lastUpdated) {
			lastUpdated = publishedAt
		}
	}

	if lastUpdated != nil {
		subtitle = "Last Updated: " + lastUpdated.Format("2 Jan 2006, 15:04")
	}

	return title, subtitle
}
