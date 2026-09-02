CREATE TABLE songs (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE song_versions (
    id UUID PRIMARY KEY,
    song_id UUID NOT NULL,

    CONSTRAINT fk_song_versions_song
    FOREIGN KEY (song_id)
    REFERENCES songs (id),

    published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE scores (
    id UUID PRIMARY KEY,
    song_id UUID NOT NULL,

    CONSTRAINT fk_song_versions_song
    FOREIGN KEY (song_id)
    REFERENCES songs (id)
);

CREATE TABLE files (
    id UUID PRIMARY KEY,
    file_name TEXT NOT NULL
);

CREATE TABLE score_versions (
    id UUID PRIMARY KEY,
    song_version_id UUID NOT NULL,

    CONSTRAINT fk_score_version_song_version
    FOREIGN KEY (song_version_id)
    REFERENCES song_versions (id),

    score_id UUID NOT NULL,

    CONSTRAINT fk_score_version_score
    FOREIGN KEY (score_id)
    REFERENCES scores (id),

    file_id UUID NOT NULL,

    CONSTRAINT fk_score_version_file
    FOREIGN KEY (file_id)
    REFERENCES files (id)
);

CREATE TABLE parts (
    id UUID PRIMARY KEY,
    song_id UUID NOT NULL,

    CONSTRAINT fk_song_versions_song
    FOREIGN KEY (song_id)
    REFERENCES songs (id),

    name TEXT NOT NULL
);

CREATE TABLE part_versions (
    id UUID PRIMARY KEY,
    song_version_id UUID NOT NULL,

    CONSTRAINT fk_part_version_song_version
    FOREIGN KEY (song_version_id)
    REFERENCES song_versions (id),

    part_id UUID NOT NULL,

    CONSTRAINT fk_part_version_part
    FOREIGN KEY (part_id)
    REFERENCES parts (id),

    file_id UUID NOT NULL,

    CONSTRAINT fk_part_version_file
    FOREIGN KEY (file_id)
    REFERENCES files (id)
);

CREATE TABLE instruments (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE concerts (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    date DATE
);

CREATE TABLE concert_songs (
    concert_id UUID NOT NULL,

    CONSTRAINT fk_concert_songs_concert
    FOREIGN KEY (concert_id)
    REFERENCES concerts (id),

    song_id UUID NOT NULL,

    CONSTRAINT fk_consert_songs_song
    FOREIGN KEY (song_id)
    REFERENCES songs (id),

    PRIMARY KEY (concert_id, song_id)
);

CREATE TABLE part_instruments (
    part_id UUID NOT NULL,

    CONSTRAINT fk_part_instruments_part
    FOREIGN KEY (part_id)
    REFERENCES parts (id),

    instrument_id UUID NOT NULL,

    CONSTRAINT fk_part_instruments_instrument
    FOREIGN KEY (instrument_id)
    REFERENCES instruments (id),

    PRIMARY KEY (part_id, instrument_id)
);
