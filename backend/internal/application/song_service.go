package application

import (
	"fmt"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type SongService struct {
	repository      SongRepository
	queryRepository SongQueryRepository
	fileZipper      FileZipper
}

func NewSongService(
	repository SongRepository,
	queryRepository SongQueryRepository,
	fileZipper FileZipper,
) *SongService {
	return &SongService{
		repository:      repository,
		queryRepository: queryRepository,
		fileZipper:      fileZipper,
	}
}

func (s *SongService) CreateSong(title string) (domain.Song, error) {
	song := domain.Song{
		ID:    ulid.Make(),
		Title: title,
	}

	if err := s.repository.Create(song); err != nil {
		return domain.Song{}, err
	}

	return song, nil
}

func (s *SongService) GetSongByID(songID ulid.ULID, query SongByIDQuery) (SongDetails, error) {
	song, err := s.queryRepository.GetByID(songID, query)
	if err != nil {
		return SongDetails{}, err
	}
	return song, nil
}

func (s *SongService) GetAllSongs(query SongQuery) ([]SongDetails, error) {
	return s.queryRepository.GetAll(query)
}

func (s *SongService) UpdateSong(songID ulid.ULID, title *string, archived *bool) (domain.Song, error) {
	song, err := s.repository.GetByID(songID)
	if err != nil {
		return domain.Song{}, err
	}

	if archived != nil {
		if *archived == true {
			now := time.Now()
			song.ArchivedAt = &now
		} else {
			song.ArchivedAt = nil
		}
	}

	if title != nil {
		song.Title = *title
	}

	if err := s.repository.Update(song); err != nil {
		return domain.Song{}, err
	}

	return song, nil
}

func (s *SongService) DownloadSong(songID ulid.ULID) (DownloadableFile, []FileDownloadError, error) {

	song, err := s.queryRepository.GetByID(songID, SongByIDQuery{IncludeScore: true})
	if err != nil {
		return DownloadableFile{}, nil, err
	}

	songs := []SongDetails{song}

	fileIDs := getFileIDsFromPublishedSongs(songs)
	if len(fileIDs) == 0 {
		return DownloadableFile{}, nil, ErrNoFilesAvailable
	}

	lastUpdatedVersion := getLatestVersionDate(songs)
	outputFileName := generateSongDownloadFileName(song.Song.Title, lastUpdatedVersion)

	downloadableFile, fileDownloadError, err := s.fileZipper.GetFilesAsZip(fileIDs, outputFileName)
	if err != nil {
		return DownloadableFile{}, fileDownloadError, err
	}

	return downloadableFile, fileDownloadError, nil

}

func generateSongDownloadFileName(songTitle string, lastUpdatedVersion time.Time) string {
	return fmt.Sprintf(
		"%s-Version-%s.zip",
		SanitizeFileName(songTitle),
		lastUpdatedVersion.Format("20060102-1504"),
	)
}
