package application

import (
	"strings"
)

func SanitizeFileName(name string) string {
	return strings.Map(func(r rune) rune {
		switch r {
		case '/', '\\', ':', '*', '?', '"', '<', '>', '|':
			return '_'
		default:
			return r
		}
	}, strings.TrimSpace(name))
}
