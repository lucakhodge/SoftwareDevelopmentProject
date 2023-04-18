CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,  /* Right now ID auto increments, could lead to secuirity risks */
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL
);

CREATE TABLE StudyGuides (
    SG_id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    user_id INT,
    rating INT, /* This is up for change,  We could implement a seperate table for this, in late dev this will be neccessary as someone could spam like on thier own post */
    dataLink VARCHAR(50), /* Assuming that we will be hosting PDF's online using a API and a link to said data */
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Reviews(
    Review_ID SERIAL PRIMARY KEY,
    SG_ID INT,
    user_ID INT,
    Review VARCHAR(250),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (SG_ID) REFERENCES StudyGuides(SG_id)
);



