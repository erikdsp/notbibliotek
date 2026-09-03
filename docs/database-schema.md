# Database Schema

## `songs`

- `id`
- `title`
- `archived_at`

## `song_versions`

- `id`
- `song_id` → `songs.id`
- `published_at`

## `scores`

- `id`
- `song_version_id` → `song_versions.id`
- `file_id` → `files.id`

## `parts`

- `id`
- `name`
- `song_version_id` → `song_versions.id`
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
