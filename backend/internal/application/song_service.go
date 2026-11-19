package application

import (
	"fmt"
	"strings"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type SongService struct {
	repository       SongRepository
	queryRepository  SongQueryRepository
	fileZipper       FileZipper
	instrumentLookup InstrumentLookup
}

func NewSongService(
	repository SongRepository,
	queryRepository SongQueryRepository,
	fileZipper FileZipper,
	instrumentLookup InstrumentLookup,
) *SongService {
	return &SongService{
		repository:       repository,
		queryRepository:  queryRepository,
		fileZipper:       fileZipper,
		instrumentLookup: instrumentLookup,
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

	lastUpdatedVersion := getLatestIncludedVersionDate(songs)
	outputFileName := generateSongDownloadFileName(song.Song.Title, lastUpdatedVersion)

	downloadableFile, fileDownloadError, err := s.fileZipper.GetFilesAsZip(
		ZipRequest{FileIDs: fileIDs, OutputFileName: outputFileName},
	)
	if err != nil {
		return DownloadableFile{}, fileDownloadError, err
	}

	return downloadableFile, fileDownloadError, nil

}

func generateSongDownloadFileName(songTitle string, lastUpdatedVersion time.Time) string {
	return fmt.Sprintf(
		"%s-Updated-%s.zip",
		SanitizeFileName(songTitle),
		lastUpdatedVersion.Format("2006-01-02-1504"),
	)
}

func (s *SongService) DownloadAllSongs(query DownloadQuery) (DownloadableFile, []FileDownloadError, error) {
	if err := validateDownloadQuery(query); err != nil {
		return DownloadableFile{}, nil, err
	}

	instruments, err := s.instrumentLookup.GetByKeys(query.Instruments)
	if err != nil {
		return DownloadableFile{}, nil, err
	}
	if err := validateInstrumentKeys(query.Instruments, len(instruments)); err != nil {
		return DownloadableFile{}, nil, err
	}

	songs, err := s.queryRepository.GetAll(query.ToSongQuery())
	if err != nil {
		return DownloadableFile{}, nil, err
	}

	fileIDs := getFileIDsFromPublishedSongs(songs)
	if len(fileIDs) == 0 {
		return DownloadableFile{}, nil, ErrNoFilesAvailable
	}

	lastUpdatedVersion := getLatestIncludedVersionDate(songs)
	instrumentNames := getDownloadInstrumentNames(instruments, query.IncludeUnconnectedParts)
	outputFileName := generateAllSongsDownloadFileName(instrumentNames, lastUpdatedVersion)

	downloadableFile, fileDownloadErrors, err := s.fileZipper.GetFilesAsZip(
		ZipRequest{FileIDs: fileIDs, OutputFileName: outputFileName},
	)
	if err != nil {
		return DownloadableFile{}, fileDownloadErrors, err
	}

	return downloadableFile, fileDownloadErrors, nil
}

func generateAllSongsDownloadFileName(instrumentNames []string, lastUpdatedVersion time.Time) string {
	return fmt.Sprintf(
		"All-Songs-%s-Updated-%s.zip",
		SanitizeFileName(strings.Join(instrumentNames, "-")),
		lastUpdatedVersion.Format("2006-01-02-1504"),
	)
}
