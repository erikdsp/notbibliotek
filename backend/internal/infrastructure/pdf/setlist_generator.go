package pdf

import (
	"fmt"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/signintech/gopdf"
)

const (
	pageMargin = 40.0

	titleFontSize = 22
	dateFontSize  = 14

	titleLineHeight  = 30.0
	dateLineHeight   = 20.0
	titleDateSpacing = 5.0
)

type SetlistGenerator struct{}

func NewSetlistGenerator() *SetlistGenerator {
	return &SetlistGenerator{}
}

func (g *SetlistGenerator) Generate(setlist application.Setlist) ([]byte, error) {
	document := &gopdf.GoPdf{}

	document.Start(gopdf.Config{
		PageSize: *gopdf.PageSizeA4,
	})
	document.AddPage()

	if err := registerFonts(document); err != nil {
		return nil, fmt.Errorf("register PDF fonts: %w", err)
	}

	nextY, err := drawHeader(document, setlist, pageMargin)
	if err != nil {
		return nil, fmt.Errorf("draw PDF header: %w", err)
	}

	_ = nextY

	return document.GetBytesPdfReturnErr()
}

func drawHeader(
	document *gopdf.GoPdf,
	setlist application.Setlist,
	startY float64,
) (nextY float64, err error) {
	if err := document.SetFont("title", "", titleFontSize); err != nil {
		return 0, err
	}

	document.SetXY(pageMargin, startY)

	if err := document.Cell(nil, setlist.ConcertName); err != nil {
		return 0, err
	}

	dateY := startY + titleLineHeight + titleDateSpacing

	if err := document.SetFont("titleDate", "", dateFontSize); err != nil {
		return 0, err
	}

	document.SetXY(pageMargin, dateY)

	if err := document.Cell(nil, setlist.ConcertDate.Format("2006-01-02")); err != nil {
		return 0, err
	}

	return dateY + dateLineHeight, nil
}
