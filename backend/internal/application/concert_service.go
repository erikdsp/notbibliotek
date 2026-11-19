package application

import (
	"fmt"
	"strings"
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/domain"

	"github.com/oklog/ulid/v2"
)

type ConcertService struct {
	repository            ConcertRepository
	concertSongRepository ConcertSongRepository
	songQueryRepository   SongQueryRepository
	fileZipper            FileZipper
	instrumentLookup      InstrumentLookup
	setlistGenerator      SetlistGenerator
}

func NewConcertService(
	repository ConcertRepository,
	concertSongRepository ConcertSongRepository,
	songQueryRepository SongQueryRepository,
	fileZipper FileZipper,
	instrumentLookup InstrumentLookup,
	setlistGenerator SetlistGenerator,
) *ConcertService {
	return &ConcertService{
		repository:            repository,
		concertSongRepository: concertSongRepository,
		songQueryRepository:   songQueryRepository,
		fileZipper:            fileZipper,
		instrumentLookup:      instrumentLookup,
		setlistGenerator:      setlistGenerator,
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

func (s *ConcertService) DownloadConcert(concertID ulid.ULID, query DownloadQuery) (DownloadableFile, []FileDownloadError, error) {
	concert, err := s.GetConcertByID(concertID)
	if err != nil {
		return DownloadableFile{}, nil, err
	}

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

	songs, err := s.songQueryRepository.GetAll(
		query.ToSongQueryWithConcert(concert.Concert.Key),
	)
	if err != nil {
		return DownloadableFile{}, nil, err
	}

	fileIDs := getFileIDsFromPublishedSongs(songs)
	if len(fileIDs) == 0 {
		return DownloadableFile{}, nil, ErrNoFilesAvailable
	}

	lastUpdatedVersion := getLatestIncludedVersionDate(songs)
	instrumentNames := getDownloadInstrumentNames(instruments, query.IncludeUnconnectedParts)
	outputFileName := generateConcertDownloadFileName(concert.Concert, instrumentNames, lastUpdatedVersion)
	setlistData, err := s.setlistGenerator.Generate(
		createSetlist(&concert.Concert, songs, true, strings.Join(instrumentNames, ", ")))
	if err != nil {
		return DownloadableFile{}, nil, err
	}
	setlistName := generateConcertSetlistName(concert.Concert, instrumentNames)

	downloadableFile, fileDownloadError, err := s.fileZipper.GetFilesAsZip(
		ZipRequest{
			Files:          []ZipEntry{{FileName: setlistName, Data: setlistData}},
			FileIDs:        fileIDs,
			OutputFileName: outputFileName},
	)
	if err != nil {
		return DownloadableFile{}, fileDownloadError, err
	}

	return downloadableFile, fileDownloadError, nil
}

func generateConcertDownloadFileName(concert domain.Concert, instrumentNames []string, lastUpdatedVersion time.Time) string {
	return fmt.Sprintf(
		"%s-%s-%s-Updated-%s.zip",
		SanitizeFileName(concert.Name),
		concert.Date.Format("2006-01-02"),
		SanitizeFileName(strings.Join(instrumentNames, "-")),
		lastUpdatedVersion.Format("2006-01-02-1504"),
	)
}

func generateConcertSetlistName(concert domain.Concert, instrumentNames []string) string {
	return fmt.Sprintf(
		"Setlist - %s - %s.pdf",
		SanitizeFileName(strings.Join(instrumentNames, "-")),
		SanitizeFileName(concert.Name),
	)
}
