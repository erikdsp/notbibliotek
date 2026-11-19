package pdf

import (
	"fmt"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/signintech/gopdf"
)

const (
	pageMargin = 40.0

	titleFontSize      = 22
	dateFontSize       = 14
	instrumentFontSize = 14

	titleLineHeight      = 24.0
	dateLineHeight       = 20.0
	instrumentLineHeight = 20.0

	headerSpacing = 5.0

	songColumnWidth    = 200.0
	partsColumnWidth   = 125.0
	versionColumnWidth = 140.0

	additionalWidth = 40.0
	columnGap       = 12.0

	tableTopSpacing          = 20.0
	tableHeaderHeight        = 24.0
	tableHeaderBottomSpacing = 4.0
	tableRowHeight           = 24.0

	tableFontSize = 10
)

type tableLayout struct {
	songX       float64
	partsX      float64
	versionX    float64
	tableRightX float64
	showParts   bool
}

func (l tableLayout) songWidth() float64 {
	return l.partsX - l.songX - columnGap
}

func newTableLayout(showParts bool) tableLayout {
	songWidth := songColumnWidth
	if !showParts {
		songWidth += additionalWidth
	}

	layout := tableLayout{
		songX:     pageMargin,
		showParts: showParts,
	}

	layout.partsX = layout.songX + songWidth + columnGap
	layout.versionX = layout.partsX

	if showParts {
		layout.versionX += partsColumnWidth + columnGap
	}

	layout.tableRightX = layout.versionX + versionColumnWidth

	return layout
}

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

	if err := drawTable(document, setlist, nextY+tableTopSpacing); err != nil {
		return nil, fmt.Errorf("draw PDF table: %w", err)
	}
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

	if err := document.Cell(nil, setlist.Title); err != nil {
		return 0, err
	}

	dateY := startY + titleLineHeight + headerSpacing

	if err := document.SetFont("subtitle", "", dateFontSize); err != nil {
		return 0, err
	}

	document.SetXY(pageMargin, dateY)

	if err := document.Cell(nil, setlist.Subtitle); err != nil {
		return 0, err
	}

	nextY = dateY + dateLineHeight

	if setlist.ShowParts && setlist.InstrumentLabel != "" {
		if err := document.SetFont("title", "", instrumentFontSize); err != nil {
			return 0, err
		}

		instrumentY := nextY + headerSpacing
		document.SetXY(pageMargin, instrumentY)

		if err := document.Cell(nil, setlist.InstrumentLabel); err != nil {
			return 0, err
		}

		nextY = instrumentY + instrumentLineHeight
	}

	return nextY, nil
}

func drawContinuationHeader(
	document *gopdf.GoPdf,
	setlist application.Setlist,
	startY float64,
) (nextY float64, err error) {
	if err := document.SetFont("subtitle", "", dateFontSize); err != nil {
		return 0, err
	}

	document.SetXY(pageMargin, startY)

	header := setlist.Title

	if setlist.ShowParts && setlist.InstrumentLabel != "" {
		header += ", " + setlist.InstrumentLabel
	}

	if err := document.Cell(nil, "("+header+")"); err != nil {
		return 0, err
	}

	return startY + dateLineHeight, nil
}

func addContinuationPage(
	document *gopdf.GoPdf,
	setlist application.Setlist,
	layout tableLayout,
) (nextY float64, err error) {
	document.AddPage()

	y, err := drawContinuationHeader(document, setlist, pageMargin)
	if err != nil {
		return 0, err
	}

	return drawTableHeader(document, y+tableTopSpacing, layout)
}

func drawTable(
	document *gopdf.GoPdf,
	setlist application.Setlist,
	startY float64,
) error {
	layout := newTableLayout(setlist.ShowParts)

	y, err := drawTableHeader(document, startY, layout)
	if err != nil {
		return err
	}

	for _, song := range setlist.Songs {
		rowCount := 1
		if layout.showParts && len(song.Parts) > 1 {
			rowCount = len(song.Parts)
		}

		for rowIndex := 0; rowIndex < rowCount; rowIndex++ {
			songContinuesOnNewPage := false

			if y+tableRowHeight > gopdf.PageSizeA4.H-pageMargin {
				y, err = addContinuationPage(document, setlist, layout)
				if err != nil {
					return err
				}

				songContinuesOnNewPage = rowIndex > 0
			}

			if err := drawTableRow(
				document, song, rowIndex, songContinuesOnNewPage, y, layout,
			); err != nil {
				return err
			}

			y += tableRowHeight
		}
	}

	return nil
}

func drawTableRow(
	document *gopdf.GoPdf,
	song application.SetlistSong,
	rowIndex int,
	songContinuesOnNewPage bool,
	y float64,
	layout tableLayout,
) error {
	if rowIndex == 0 || songContinuesOnNewPage {
		title := song.Title

		if songContinuesOnNewPage {
			title = "(" + title + ")"
		}

		if err := drawTableText(
			document, "bold", title, layout.songX, y, layout.songWidth(),
		); err != nil {
			return err
		}
	}

	if rowIndex == 0 {
		version := "No published version"
		versionFont := "italic"

		if song.PublishedAt != nil {
			version = song.PublishedAt.Format("2 Jan 2006, 15:04")
			versionFont = "regular"
		}

		if err := drawTableText(
			document, versionFont, version, layout.versionX, y, versionColumnWidth,
		); err != nil {
			return err
		}
	}

	if layout.showParts {
		var part string
		partFont := "italic"

		if len(song.Parts) > 0 {
			part = song.Parts[rowIndex]
			partFont = "regular"
		} else if song.PublishedAt != nil {
			part = "Missing"
		}

		if err := drawTableText(
			document, partFont, part, layout.partsX, y, partsColumnWidth,
		); err != nil {
			return err
		}
	}

	return nil
}

func drawTableHeader(
	document *gopdf.GoPdf,
	y float64,
	layout tableLayout,
) (nextY float64, err error) {

	if err := drawTableText(
		document, "bold", "Song", layout.songX, y, layout.songWidth(),
	); err != nil {
		return 0, err
	}

	if layout.showParts {
		if err := drawTableText(
			document, "bold", "Parts", layout.partsX, y, partsColumnWidth,
		); err != nil {
			return 0, err
		}
	}

	if err := drawTableText(
		document, "bold", "Version", layout.versionX, y, versionColumnWidth,
	); err != nil {
		return 0, err
	}

	y += tableHeaderHeight

	document.SetStrokeColor(0, 0, 0)
	document.SetLineWidth(0.8)
	document.Line(pageMargin, y, layout.tableRightX, y)

	return y + tableHeaderBottomSpacing, nil
}

func drawTableText(
	document *gopdf.GoPdf,
	font string,
	value string,
	x float64,
	y float64,
	maxWidth float64,
) error {
	if err := document.SetFont(font, "", tableFontSize); err != nil {
		return err
	}

	value, err := truncateTableText(document, value, maxWidth)
	if err != nil {
		return err
	}

	document.SetXY(x, y)

	return document.Cell(nil, value)
}

func truncateTableText(
	document *gopdf.GoPdf,
	value string,
	maxWidth float64,
) (string, error) {
	width, err := document.MeasureTextWidth(value)
	if err != nil {
		return "", err
	}

	if width <= maxWidth {
		return value, nil
	}

	runes := []rune(value)

	for len(runes) > 0 {
		truncated := string(runes) + "…"

		width, err := document.MeasureTextWidth(truncated)
		if err != nil {
			return "", err
		}

		if width <= maxWidth {
			return truncated, nil
		}

		runes = runes[:len(runes)-1]
	}

	return "…", nil
}
