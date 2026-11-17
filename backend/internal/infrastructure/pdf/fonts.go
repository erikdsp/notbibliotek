package pdf

import (
	_ "embed"

	"github.com/signintech/gopdf"
)

//go:embed fonts/JosefinSans-Regular.ttf
var josefinSansRegular []byte

//go:embed fonts/JosefinSans-Thin.ttf
var josefinSansThin []byte

//go:embed fonts/OpenSans-Bold.ttf
var openSansBold []byte

//go:embed fonts/OpenSans-Regular.ttf
var openSansRegular []byte

//go:embed fonts/OpenSans-LightItalic.ttf
var openSansLightItalic []byte

func registerFonts(document *gopdf.GoPdf) error {
	fonts := []struct {
		name string
		data []byte
	}{
		{"title", josefinSansRegular},
		{"titleDate", josefinSansThin},
		{"bold", openSansBold},
		{"regular", openSansRegular},
		{"italic", openSansLightItalic},
	}

	for _, font := range fonts {
		if err := document.AddTTFFontData(font.name, font.data); err != nil {
			return err
		}
	}

	return nil
}
