# Domain Model

```mermaid
erDiagram
    SONG ||--o{ SONG_VERSION : has
    SONG_VERSION ||--o| SCORE : contains
    SONG_VERSION ||--o{ PART : contains
    SCORE }o--|| FILE : references
    PART }o--|| FILE : references
    PART }o--o{ INSTRUMENT : uses
    CONCERT }o--o{ SONG : contains

    SONG {
        ULID id
        string title
        datetime archived_at
    }

    SONG_VERSION {
        ULID id
        ULID song_id
        datetime published_at
    }

    SCORE {
        ULID id
        ULID song_version_id
        ULID file_id
    }

    PART {
        ULID id
        string name
        string key
        ULID song_version_id
        ULID file_id
    }

    INSTRUMENT {
        ULID id
        string name
        string key
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
- `SongVersion` represents a version of a song and is the unit of publication.
- `Score` represents the full score for a song version.
- `Part` represents an individual part for a song version.
- `File` contains metadata about a stored file, while the actual file contents are managed by the file storage implementation.
- A `Part` can be associated with multiple `Instrument` records.
- A `Concert` consists of a set of `Song` records.
```
