package http

import (
	"fmt"
	"net/http"
	"net/url"
)

func setDownloadFileName(w http.ResponseWriter, fileName string) {
	w.Header().Set(
		"Content-Disposition",
		fmt.Sprintf(
			`attachment; filename="download.zip"; filename*=UTF-8''%s`,
			url.PathEscape(fileName),
		),
	)
}
