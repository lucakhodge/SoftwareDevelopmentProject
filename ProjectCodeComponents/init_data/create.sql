CREATE TABLE Users(
    username VARCHAR(50) PRIMARY KEY, /* reference table of liked */
    password VARCHAR(60) NOT NULL
);


-- DROP TABLE IF EXISTS StudyGuides CASCADE;
CREATE TABLE StudyGuides(
    SG_id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    user_id INT,
    likes INT, /* This is up for change,  We could implement a seperate table for this, in late dev this will be neccessary as someone could spam like on thier own post */
    dataLink VARCHAR(50) /* Assuming that we will be hosting PDF's online using a API and a link to said data */
);

-- DROP TABLE IF EXISTS tags CASCADE;
CREATE TABLE tags(
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(20)
);

INSERT INTO tags (tag_id, tag_name) values (1, 'Lecture Notes');
INSERT INTO tags (tag_id, tag_name) values (2, 'Article');
INSERT INTO tags (tag_id, tag_name) values (3, 'Practice Tests');


-- DROP TABLE IF EXISTS StudyGuides_to_Tags CASCADE;
CREATE TABLE StudyGuides_to_Tags(
    SG_id INT,
    tag_id INT
);

-- DROP TABLE IF EXISTS LikedStudyGuides_to_Users CASCADE;
CREATE TABLE LikedStudyGuides_to_Users(
    SG_id INT,
    username VARCHAR(50)
);





