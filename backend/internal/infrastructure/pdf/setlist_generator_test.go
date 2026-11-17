package pdf

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
)

func TestGenerateSetlist(t *testing.T) {
	generator := NewSetlistGenerator()

	setlist := application.Setlist{
		ConcertName: "Höstkonsert 2026",
		ConcertDate: time.Date(2026, 11, 21, 0, 0, 0, 0, time.Local),
	}

	data, err := generator.Generate(setlist)
	if err != nil {
		t.Fatal(err)
	}

	outputDir := "test_output"

	if err := os.MkdirAll(outputDir, 0o755); err != nil {
		t.Fatal(err)
	}

	outputPath := filepath.Join(outputDir, "setlist.pdf")

	if err := os.WriteFile(outputPath, data, 0o644); err != nil {
		t.Fatal(err)
	}
}
