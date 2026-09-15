package application

type SongQueryRepository interface {
	GetAll(query SongQuery) ([]SongDetails, error)
}
