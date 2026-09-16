package application

import (
	"github.com/erikdsp/notbibliotek/backend/internal/domain"
)

func toSongVersionDetails(version domain.SongVersion) SongVersionDetails {
	return SongVersionDetails{
		ID:          version.ID,
		PublishedAt: version.PublishedAt,
	}
}

func toScoreDetails(score domain.Score) ScoreDetails {
	return ScoreDetails{
		ID:     score.ID,
		FileID: score.FileID,
	}
}

func toPartDetails(part domain.Part) PartDetails {
	return PartDetails{
		ID:     part.ID,
		Key:    part.Key,
		Name:   part.Name,
		FileID: part.FileID,
	}
}

func toPartsDetails(parts []domain.Part) []PartDetails {
	partDetails := make([]PartDetails, 0, len(parts))
	for _, part := range parts {
		partDetails = append(partDetails, toPartDetails(part))
	}
	return partDetails
}
