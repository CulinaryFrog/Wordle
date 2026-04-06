CREATE TABLE IF NOT EXISTS wordbank (
    id SERIAL PRIMARY KEY,
    word VARCHAR(5) NOT NULL
);

INSERT INTO wordbank (word) VALUES ('TESTS'), ('REACT'), ('HOLDS'),('ADIEU');

