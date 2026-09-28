package http

type CreateSongRequest struct {
	Title string `json:"title"`
}

type UpdateSongRequest struct {
	Title    *string `json:"title"`
	Archived *bool   `json:"archived"`
}

type CreateInstrumentRequest struct {
	Key  string `json:"key"`
	Name string `json:"name"`
}

type UpdateInstrumentRequest struct {
	Key  *string `json:"key"`
	Name *string `json:"name"`
}
