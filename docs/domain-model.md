# Domain Model

```mermaid
erDiagram
    SONG ||--o| SCORE : has
    SONG ||--o{ PART : contains
    PART }o--o{ INSTRUMENT : uses
    PART ||--o{ PART_VERSION : has
    SCORE ||--o{ SCORE_VERSION : has
    PART_VERSION }o--|| FILE : references
    SCORE_VERSION }o--|| FILE : references
    CONCERT }o--o{ SONG : contains

    SONG {
        ULID id
        string title
        datetime archived_at
    }

    SCORE {
        ULID id
        ULID song_id
    }

    PART {
        ULID id
        ULID song_id
        string name
    }

    INSTRUMENT {
        ULID id
        string name
    }

    SONG_VERSION {
        ULID id
        ULID song_id
        datetime published_at
    }

    PART_VERSION {
        ULID id
        ULID song_version_id
        ULID part_id
        ULID file_id
    }

    SCORE_VERSION {
        ULID id
        ULID song_version_id
        ULID score_id
        ULID file_id
    }

    FILE {
        ULID id
        string file_name
    }

    CONCERT {
        ULID id
        string name
        date date
    }
```

```markdown
## Design notes

- `Song` represents a musical work in the library.
- `Score` represents the full score for a song and is optional.
- `Part` represents an individual part for a song.
- `PartVersion` and `ScoreVersion` keep track of version of
  the corresponding material.
- `File` contains metadata about a stored file, while the actual file contents are managed by the file storage implementation.
- A `Part` can be associated with multiple `Instrument` records.
- A `Concert` consists of a set of `Song` records.
```
