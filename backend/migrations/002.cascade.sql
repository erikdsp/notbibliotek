-- Delete part-instrument connections when a part is deleted
ALTER TABLE part_instruments
DROP CONSTRAINT fk_part_instruments_part;

ALTER TABLE part_instruments
ADD CONSTRAINT fk_part_instruments_part
FOREIGN KEY (part_id)
REFERENCES parts (id)
ON DELETE CASCADE;

-- Delete concert-song connections when a concert is deleted
ALTER TABLE concert_songs
DROP CONSTRAINT fk_concert_songs_concert;

ALTER TABLE concert_songs
ADD CONSTRAINT fk_concert_songs_concert
FOREIGN KEY (concert_id)
REFERENCES concerts (id)
ON DELETE CASCADE;
