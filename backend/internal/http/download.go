package http

import (
	"fmt"
	"net/http"
	"net/url"
	"path/filepath"
)

func setDownloadFileName(w http.ResponseWriter, fileName string) {
	fallbackName := "download" + filepath.Ext(fileName)

	w.Header().Set(
		"Content-Disposition",
		fmt.Sprintf(
			`attachment; filename="%s"; filename*=UTF-8''%s`,
			fallbackName,
			url.PathEscape(fileName),
		),
	)
}
