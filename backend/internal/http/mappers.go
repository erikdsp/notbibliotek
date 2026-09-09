package http

import (
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

func toVersionResponse(version application.VersionDetails) VersionResponse {
	response := VersionResponse{
		SongVersionID: version.Version.ID,
		PublishedAt:   version.Version.PublishedAt,
		Parts:         []PartForVersion{},
	}

	if version.Score != nil {
		response.Score = ScoreForVersion{
			ID:     version.Score.Score.ID,
			FileID: version.Score.File.ID,
		}
	}

	for _, part := range version.Parts {
		response.Parts = append(response.Parts, PartForVersion{
			ID:     part.Part.ID,
			Key:    part.Part.Key,
			Name:   part.Part.Name,
			FileID: part.File.ID,
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
		versions = append(versions, toVersionResponse(version))
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
