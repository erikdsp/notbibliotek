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
        int id
        string title
        datetime archived_at
    }

    SCORE {
        int id
        int song_id
    }

    PART {
        int id
        int song_id
        string name
    }

    INSTRUMENT {
        int id
        string name
    }

    PART_VERSION {
        int id
        int part_id
        int file_id
        datetime published_at
    }

    SCORE_VERSION {
        int id
        int score_id
        int file_id
        datetime published_at
    }

    FILE {
        int id
        string storage_key
        string filename
    }

    CONCERT {
        int id
        string name
        date date
    }
```

```markdown
## Design notes

- `Song` represents a musical work in the library.
- `Score` represents the full score for a song and is optional.
- `Part` represents an individual part for a song.
- `PartVersion` and `ScoreVersion` keep track of published versions of
  the corresponding material.
- `File` represents the physical file stored in object storage and is
  kept separate from the domain metadata.
- A `Part` can be associated with multiple `Instrument` records.
- A `Concert` consists of a set of `Song` records.
```
