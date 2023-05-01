CREATE TABLE Users(
    username VARCHAR(50) PRIMARY KEY, /* reference table of liked */
    password VARCHAR(60) NOT NULL
);

DROP TABLE IF EXISTS StudyGuides CASCADE;
CREATE TABLE StudyGuides(
    SG_id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    username VARCHAR(50), /* Changed to username,  User_ID was a mistake. */
    likes INT, /* This is up for change,  We could implement a seperate table for this, in late dev this will be neccessary as someone could spam like on thier own post */
    dataLink VARCHAR(250) /* Assuming that we will be hosting PDF's online using a API and a link to said data */
);

-- INSERT INTO StudyGuides (name, username, likes, dataLink) values ('Dijkstra's Algorithm', 'Aidan', 10, 'PDF');
-- INSERT INTO StudyGuides (name, username, likes, dataLink) values ('Micro Economics', 'Luca', 3, 'PNG');
-- INSERT INTO StudyGuides (name, username, likes, dataLink) values ('Greek Mythology', 'Tyler', 7, 'PSD');
-- INSERT INTO StudyGuides (name, username, likes, dataLink) values ('Particle Physics', 'Alex', 5, 'PDF');

DROP TABLE IF EXISTS tags CASCADE;
CREATE TABLE tags(
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(20)
);

INSERT INTO tags (tag_id, tag_name) values (1, 'Lecture Notes');
INSERT INTO tags (tag_id, tag_name) values (2, 'Article');
INSERT INTO tags (tag_id, tag_name) values (3, 'Practice Tests');

DROP TABLE IF EXISTS subjects CASCADE;
CREATE TABLE subjects(
    sub_id SERIAL PRIMARY KEY,
    sub_name VARCHAR(30)
);

INSERT INTO subjects (sub_id, sub_name) values (1, 'Arts & Sciences');
INSERT INTO subjects (sub_id, sub_name) values (2, 'Business');
INSERT INTO subjects (sub_id, sub_name) values (3, 'Engineering & Applied Science');
INSERT INTO subjects (sub_id, sub_name) values (4, 'Communication');

DROP TABLE IF EXISTS StudyGuides_to_Subjects CASCADE;
CREATE TABLE StudyGuides_to_Subjects(
    SG_id INT,
    sub_id INT
);

-- INSERT INTO StudyGuides_to_Subjects (SG_id, sub_id) values (1, 3);
-- INSERT INTO StudyGuides_to_Subjects (SG_id, sub_id) values (2, 2);
-- INSERT INTO StudyGuides_to_Subjects (SG_id, sub_id) values (3, 1);
-- INSERT INTO StudyGuides_to_Subjects (SG_id, sub_id) values (4, 3);

DROP TABLE IF EXISTS StudyGuides_to_Tags CASCADE;
CREATE TABLE StudyGuides_to_Tags(
    SG_id INT,
    tag_id INT
);

-- INSERT INTO StudyGuides_to_Tags (SG_id, tag_id) values (1, 1);
-- INSERT INTO StudyGuides_to_Tags (SG_id, tag_id) values (1, 2);
-- INSERT INTO StudyGuides_to_Tags (SG_id, tag_id) values (1, 3);
-- INSERT INTO StudyGuides_to_Tags (SG_id, tag_id) values (2, 2);
-- INSERT INTO StudyGuides_to_Tags (SG_id, tag_id) values (2, 3);
-- INSERT INTO StudyGuides_to_Tags (SG_id, tag_id) values (3, 1);
-- INSERT INTO StudyGuides_to_Tags (SG_id, tag_id) values (4, 2);

DROP TABLE IF EXISTS LikedStudyGuides_to_Users CASCADE;
CREATE TABLE LikedStudyGuides_to_Users(
    SG_id INT,
    username VARCHAR(50)
);