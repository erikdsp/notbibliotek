# Database Schema

## `songs`

- `id`
- `title`
- `archived_at`

## `scores`

- `id`
- `song_id` → `songs.id`

## `score_versions`

- `id`
- `score_id` → `scores.id`
- `published_at`
- `file_id` → `files.id`

## `parts`

- `id`
- `song_id` → `songs.id`
- `name`

## `part_versions`

- `id`
- `part_id` → `parts.id`
- `published_at`
- `file_id` → `files.id`

## `instruments`

- `id`
- `name`

## `files`

- `id`
- `file_name`

## `concerts`

- `id`
- `name`
- `date`

## `concert_songs`

- `concert_id` → `concerts.id`
- `song_id` → `songs.id`

## `part_instruments`

- `part_id` → `parts.id`
- `instrument_id` → `instruments.id`
