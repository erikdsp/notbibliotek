package http

import (
	"time"

	"github.com/erikdsp/notbibliotek/backend/internal/application"
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
)

func toSongResponse(song domain.Song) SongResponse {
	return SongResponse{
		ID:         song.ID,
		Title:      song.Title,
		ArchivedAt: song.ArchivedAt,
	}
}

func toSongResponses(songs []domain.Song) []SongResponse {
	responses := make([]SongResponse, 0, len(songs))

	for _, song := range songs {
		responses = append(responses, toSongResponse(song))
	}
	return responses
}

func toVersionResponse(version application.VersionDetails) VersionResponse {
	response := VersionResponse{
		SongVersionID: version.Version.ID,
		PublishedAt:   version.Version.PublishedAt,
		Parts:         []PartForVersion{},
	}

	var score *ScoreForVersion

	if version.Score != nil {
		score = &ScoreForVersion{
			ID:     version.Score.ID,
			FileID: version.Score.FileID,
		}

	}

	response.Score = score

	for _, part := range version.Parts {
		response.Parts = append(response.Parts, PartForVersion{
			ID:     part.ID,
			Key:    part.Key,
			Name:   part.Name,
			FileID: part.FileID,
		})
	}

	return response
}

func toSongDetailedResponses(songs []application.SongDetails) []SongDetailedResponse {
	responses := make([]SongDetailedResponse, 0, len(songs))
	for _, song := range songs {
		responses = append(responses, toSongDetailedResponse(song))
	}
	return responses
}

func toSongDetailedResponse(song application.SongDetails) SongDetailedResponse {
	versions := make([]VersionResponse, 0, len(song.Versions))

	for _, version := range song.Versions {
		versions = append(versions, toVersionResponse(*version))
	}

	return SongDetailedResponse{
		ID:               song.Song.ID,
		Title:            song.Song.Title,
		ArchivedAt:       song.Song.ArchivedAt,
		CurrentVersionID: song.CurrentVersionID,
		Versions:         versions,
	}
}

func toScoreResponse(score domain.Score) ScoreResponse {
	return ScoreResponse{
		ID:            score.ID,
		SongVersionID: score.SongVersionID,
		FileID:        score.FileID,
	}
}

func toPartResponse(part domain.Part) PartResponse {
	return PartResponse{
		ID:            part.ID,
		Key:           part.Key,
		Name:          part.Name,
		SongVersionID: part.SongVersionID,
		FileID:        part.FileID,
	}
}

func toInstrumentResponse(instrument domain.Instrument) InstrumentResponse {
	return InstrumentResponse{
		ID:   instrument.ID,
		Key:  instrument.Key,
		Name: instrument.Name,
	}
}

func toInstrumentResponses(instruments []domain.Instrument) []InstrumentResponse {
	responses := make([]InstrumentResponse, 0, len(instruments))

	for _, instrument := range instruments {
		responses = append(responses, toInstrumentResponse(instrument))
	}

	return responses
}

func toConcertResponse(concert domain.Concert) ConcertResponse {
	return ConcertResponse{
		ID:   concert.ID,
		Key:  concert.Key,
		Name: concert.Name,
		Date: concert.Date.Format(time.DateOnly),
	}
}

func toConcertDetailedResponse(concert application.ConcertDetails) ConcertDetailedResponse {
	return ConcertDetailedResponse{
		ID:    concert.Concert.ID,
		Key:   concert.Concert.Key,
		Name:  concert.Concert.Name,
		Date:  concert.Concert.Date.Format(time.DateOnly),
		Songs: toSongResponses(concert.Songs),
	}
}

func toConcertDetailedResponses(concerts []application.ConcertDetails) []ConcertDetailedResponse {
	responses := make([]ConcertDetailedResponse, 0, len(concerts))

	for _, concert := range concerts {
		responses = append(responses, toConcertDetailedResponse(concert))
	}

	return responses
}
