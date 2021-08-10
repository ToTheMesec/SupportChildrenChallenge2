CREATE DATABASE supportchildren;

CREATE TABLE campaigns(
    camp_id SERIAL PRIMARY KEY,
    camp_title VARCHAR(255) NOT NULL,
    camp_description VARCHAR(5000) NOT NULL,
    camp_email VARCHAR(150) NOT NULL,
    camp_url VARCHAR(5000) NOT NULL,
    camp_dateCreated TIMESTAMP NOT NULL,
    camp_deadline TIMESTAMP NOT NULL,
    camp_goal FLOAT(19) NOT NULL,
    camp_currency VARCHAR(5) NOT NULL,
    camp_category VARCHAR(30) NOT NULL,
    camp_raised FLOAT(19) DEFAULT 0,
    camp_isFinished BOOLEAN DEFAULT FALSE
);