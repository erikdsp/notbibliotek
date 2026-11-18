package http

import (
	"fmt"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
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

func parseDownloadQuery(rawQuery string) (application.DownloadQuery, error) {
	queryValues, err := url.ParseQuery(rawQuery)
	if err != nil {
		return application.DownloadQuery{}, err
	}

	query := application.DownloadQuery{
		Instruments: queryValues["instrument"],
	}

	if includeUnconnectedParts := queryValues.Get("include_unconnected_parts"); includeUnconnectedParts != "" {
		queryValue, err := strconv.ParseBool(includeUnconnectedParts)
		if err != nil {
			return application.DownloadQuery{}, fmt.Errorf("invalid include_unconnected_parts: %w", err)
		}
		query.IncludeUnconnectedParts = queryValue
	}

	return query, nil
}
