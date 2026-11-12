package application

import (
	"fmt"
	"strings"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"
	"github.com/erikdsp/notbibliotek/backend/internal/utils/set"

	"github.com/oklog/ulid/v2"
)

type ConcertService struct {
	repository            ConcertRepository
	concertSongRepository ConcertSongRepository
	songQueryRepository   SongQueryRepository
	fileZipper            FileZipper
	instrumentLookup      InstrumentLookup
}

func NewConcertService(
	repository ConcertRepository,
	concertSongRepository ConcertSongRepository,
	songQueryRepository SongQueryRepository,
	fileZipper FileZipper,
	instrumentLookup InstrumentLookup,
) *ConcertService {
	return &ConcertService{
		repository:            repository,
		concertSongRepository: concertSongRepository,
		songQueryRepository:   songQueryRepository,
		fileZipper:            fileZipper,
		instrumentLookup:      instrumentLookup,
	}
}

func (s *ConcertService) CreateConcert(key string, name string, date time.Time) (domain.Concert, error) {
	concert := domain.Concert{
		ID:   ulid.Make(),
		Key:  key,
		Name: name,
		Date: date,
	}

	if err := s.repository.Create(concert); err != nil {
		return domain.Concert{}, err
	}

	return concert, nil
}

func (s *ConcertService) GetAllConcerts() ([]ConcertDetails, error) {
	return s.repository.GetAllWithDetails()
}

func (s *ConcertService) GetConcertByID(id ulid.ULID) (ConcertDetails, error) {
	return s.repository.GetByIDWithDetails(id)
}

func (s *ConcertService) UpdateConcert(id ulid.ULID, key *string, name *string, date *time.Time) (domain.Concert, error) {
	if key == nil && name == nil && date == nil {
		return domain.Concert{}, ErrNoFieldsToUpdate
	}

	concert, err := s.repository.GetByID(id)
	if err != nil {
		return domain.Concert{}, err
	}

	if key != nil {
		concert.Key = *key
	}

	if name != nil {
		concert.Name = *name
	}

	if date != nil {
		concert.Date = *date
	}

	if err := s.repository.Update(concert); err != nil {
		return domain.Concert{}, err
	}

	return concert, nil
}

func (s *ConcertService) DeleteConcert(id ulid.ULID) error {
	return s.repository.Delete(id)
}

func (s *ConcertService) CreateConnection(concertID ulid.ULID, songID ulid.ULID) error {
	return s.concertSongRepository.Create(concertID, songID)
}

func (s *ConcertService) DeleteConnection(concertID ulid.ULID, songID ulid.ULID) error {
	return s.concertSongRepository.Delete(concertID, songID)
}

func (s *ConcertService) DownloadConcert(concertID ulid.ULID, query DownloadConcertQuery) (DownloadableFile, []FileDownloadError, error) {
	concert, err := s.GetConcertByID(concertID)
	if err != nil {
		return DownloadableFile{}, nil, err
	}

	if err := validateDownloadConcertQuery(query); err != nil {
		return DownloadableFile{}, nil, err
	}

	instruments, err := s.instrumentLookup.GetByKeys(query.Instruments)
	if err != nil {
		return DownloadableFile{}, nil, err
	}
	if err := validateInstrumentKeys(query.Instruments, len(instruments)); err != nil {
		return DownloadableFile{}, nil, err
	}

	songs, err := s.songQueryRepository.GetAll(query.ToSongQuery(concert.Concert.Key))
	if err != nil {
		return DownloadableFile{}, nil, err
	}

	fileIDs := getFileIDsFromSongs(songs)
	if len(fileIDs) == 0 {
		return DownloadableFile{}, nil, ErrNoFilesAvailable
	}

	lastUpdatedVersion := getLatestVersionDate(songs)
	instrumentNames := getDownloadInstrumentNames(instruments, query.IncludeUnconnectedParts)
	outputFileName := generateConcertDownloadFileName(concert.Concert, instrumentNames, lastUpdatedVersion)

	downloadableFile, fileDownloadError, err := s.fileZipper.GetFilesAsZip(fileIDs, outputFileName)
	if err != nil {
		return DownloadableFile{}, fileDownloadError, err
	}

	return downloadableFile, fileDownloadError, nil
}

func getFileIDsFromSongs(songs []SongDetails) []ulid.ULID {
	var fileIDs []ulid.ULID
	for _, song := range songs {
		if song.CurrentVersionID == nil {
			continue
		}
		currentVersion := song.Versions[*song.CurrentVersionID]
		if currentVersion == nil {
			continue
		}

		fileIDs = append(fileIDs, currentVersion.Score.File.ID)

		for _, part := range currentVersion.Parts {
			fileIDs = append(fileIDs, part.File.ID)
		}
	}

	return fileIDs
}

func getDownloadInstrumentNames(
	instruments []domain.Instrument,
	includeUnconnectedParts bool,
) []string {
	var names []string

	if includeUnconnectedParts {
		names = append(names, "Odd Parts")
	}

	for _, instrument := range instruments {
		names = append(names, instrument.Name)
	}

	return names
}

func getLatestVersionDate(songs []SongDetails) time.Time {
	var latestVersion time.Time

	for _, song := range songs {
		if song.CurrentVersionID == nil {
			continue
		}

		version := song.Versions[*song.CurrentVersionID]
		if version == nil || len(version.Parts) == 0 {
			continue
		}

		if publishedAt := version.Version.PublishedAt; publishedAt != nil &&
			publishedAt.After(latestVersion) {
			latestVersion = *publishedAt
		}
	}

	return latestVersion
}

func generateConcertDownloadFileName(concert domain.Concert, instrumentNames []string, lastUpdatedVersion time.Time) string {
	return fmt.Sprintf(
		"%s-%s-%s-Updated-%s.zip",
		SanitizeFileName(concert.Name),
		concert.Date.Format("20060102"),
		SanitizeFileName(strings.Join(instrumentNames, "-")),
		lastUpdatedVersion.Format("20060102-1504"),
	)
}

func validateDownloadConcertQuery(query DownloadConcertQuery) error {
	if len(query.Instruments) == 0 && !query.IncludeUnconnectedParts {
		return fmt.Errorf("%w: instrument or include_unconnected_parts is required", ErrInvalidOperation)
	}
	return nil
}

func validateInstrumentKeys(keys []string, instrumentCount int) error {
	uniqueKeys := set.NewSet[string]()

	for _, key := range keys {
		uniqueKeys.Insert(key)
	}

	if instrumentCount != uniqueKeys.Len() {
		return ErrInstrumentNotFound
	}

	return nil
}
