package application

import "errors"

var ErrSongNotFound = errors.New("song not found")
var ErrInvalidSongID = errors.New("invalid song id")
var ErrInvalidOperation = errors.New("invalid operation")
var ErrSongVersionNotFound = errors.New("song version not found")
var ErrFileNotFound = errors.New("file not found")
var ErrScoreNotFound = errors.New("score not found")
var ErrPartNotFound = errors.New("part not found")
var ErrResourceNotFound = errors.New("resource not found")
var ErrConflictingOperation = errors.New("conflicting operation")
var ErrSongVersionAlreadyPublished = errors.New("song version already published")
var ErrNoRowsAffected = errors.New("no rows affected")
var ErrMissingScore = errors.New("missing score")
var ErrIncompleteScore = errors.New("incomplete score")
var ErrIncompletePart = errors.New("incomplete part")
