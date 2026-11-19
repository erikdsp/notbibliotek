package pdf

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
)

func TestGenerateSetlist(t *testing.T) {
	publishedAt1 := time.Date(2026, 11, 2, 13, 57, 0, 0, time.Local)
	publishedAt2 := time.Date(2026, 10, 30, 0, 7, 0, 0, time.Local)
	publishedAt3 := time.Date(2026, 11, 5, 20, 36, 0, 0, time.Local)

	songs := []application.SetlistSong{
		{
			Title:       "Alfonsina y el cantante",
			Parts:       []string{"Flute 1", "Tin Whistle", "Blade of Grass"},
			PublishedAt: &publishedAt1,
		},
		{
			Title:       "A Night In The Mountains",
			Parts:       []string{"Clarinet"},
			PublishedAt: &publishedAt2,
		},
		{
			Title:       "Beduines",
			Parts:       []string{"Flute", "Clarinet"},
			PublishedAt: &publishedAt3,
		},
		{
			Title:       "Sävliga sången",
			PublishedAt: &publishedAt3,
		},
		{
			Title: "Safety Song",
		},
	}

	var longSetlistSongs []application.SetlistSong

	for i := 1; i <= 25; i++ {
		longSetlistSongs = append(longSetlistSongs, application.SetlistSong{
			Title:       fmt.Sprintf("Song %02d", i),
			Parts:       []string{"Violin 1", "Violin 2", "Viola"},
			PublishedAt: &publishedAt1,
		})
	}

	longSetlistSongs = append(longSetlistSongs, application.SetlistSong{
		Title:       "Sävliga sången",
		Parts:       []string{"Violin 1", "Violin 2", "Viola", "Cello", "Double Bass"},
		PublishedAt: &publishedAt3,
	})

	truncatedTextSongs := []application.SetlistSong{
		{
			Title:       "A Very Long Song Title That Definitely Will Not Fit Within The Song Column",
			Parts:       []string{"Violin 1"},
			PublishedAt: &publishedAt1,
		},
		{
			Title: "Sävliga sången",
			Parts: []string{
				"Violin 1 With An Extremely Long Description That Will Not Fit",
				"Violin 2",
			},
			PublishedAt: &publishedAt2,
		},
		{
			Title:       "Short Song",
			Parts:       []string{"Cello"},
			PublishedAt: &publishedAt3,
		},
	}

	tests := []struct {
		name     string
		fileName string
		setlist  application.Setlist
	}{
		{
			name:     "Concert with parts",
			fileName: "concert_with_parts.pdf",
			setlist: application.Setlist{
				Title:           "Höstkonsert 2026",
				Subtitle:        "21 Nov 2026",
				InstrumentLabel: "Flute 1",
				ShowParts:       true,
				Songs:           songs,
			},
		},
		{
			name:     "Concert without parts",
			fileName: "concert_without_parts.pdf",
			setlist: application.Setlist{
				Title:     "Höstkonsert 2026",
				Subtitle:  "21 Nov 2026",
				ShowParts: false,
				Songs:     songs,
			},
		},
		{
			name:     "Library without parts",
			fileName: "library_without_parts.pdf",
			setlist: application.Setlist{
				Title:     "All Songs in the Library",
				Subtitle:  "Last updated: 5 Nov 2026, 20:36",
				ShowParts: false,
				Songs:     songs,
			},
		},
		{
			name:     "Library with parts",
			fileName: "library_with_parts.pdf",
			setlist: application.Setlist{
				Title:           "All Songs in the Library",
				Subtitle:        "Last updated: 5 Nov 2026, 20:36",
				InstrumentLabel: "Odd Parts",
				ShowParts:       true,
				Songs:           songs,
			},
		},
		{
			name:     "Multiple pages with song continuation",
			fileName: "multiple_pages.pdf",
			setlist: application.Setlist{
				Title:           "Höstkonsert 2026",
				Subtitle:        "21 Nov 2026",
				InstrumentLabel: "Violin 1",
				ShowParts:       true,
				Songs:           longSetlistSongs,
			},
		},
		{
			name:     "Long titles and parts",
			fileName: "truncated_text.pdf",
			setlist: application.Setlist{
				Title:           "Höstkonsert 2026",
				Subtitle:        "21 Nov 2026",
				InstrumentLabel: "Violin",
				ShowParts:       true,
				Songs:           truncatedTextSongs,
			},
		},
	}

	outputDir := "test_output"

	if err := os.MkdirAll(outputDir, 0o755); err != nil {
		t.Fatal(err)
	}

	generator := NewSetlistGenerator()

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			data, err := generator.Generate(test.setlist)
			if err != nil {
				t.Fatal(err)
			}

			outputPath := filepath.Join(outputDir, test.fileName)

			if err := os.WriteFile(outputPath, data, 0o644); err != nil {
				t.Fatal(err)
			}
		})
	}
}
