// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require("express"); // To build an application server or API
const app = express();
const pgp = require("pg-promise")(); // To connect to the Postgres DB from the node server
const bodyParser = require("body-parser");
const session = require("express-session"); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require("bcrypt"); //  To hash passwords
const axios = require("axios"); // To make HTTP requests from our server. We'll learn more about it in Part B.
const read = require("body-parser/lib/read");

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: "db", // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then((obj) => {
    console.log("Database connection successful"); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

//filestack:

app.get("/", (req, res) => {
  res.render("pages/home");
});

app.get("/upload", (req, res) => {
  res.render("pages/upload");
});

///pdf shows up as undefined through postman

app.post("/upload", (req, res) => {
  console.log(req.files);
  axios("https://www.filestackapi.com/api/store/S3?key=API_KEY", {
    method: "POST",
    header: { "Content-Type": "image/png" },
    body: req.files.data,
  })
    .then((r) => {
      console.log(r);
      res.json(r);
    })
    .catch((e) => console.log(e));
});

/*

const client = filestack.init(API_KEY);
const options = {
  onUploadDone: updateForm,
  maxSize: 10 * 1024 * 1024,
  accept: 'image/*',
  uploadInBackground: false,
};
const picker = client.picker(options);

// Get references to the DOM elements

const form = document.getElementById('pick-form');
const fileInput = document.getElementById('fileupload');
const btn = document.getElementById('picker');
const nameBox = document.getElementById('nameBox');
const urlBox = document.getElementById('urlBox');

// Add event listeners

btn.addEventListener('click', function (e) {
  e.preventDefault();
  picker.open();
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  alert('Submitting: ' + fileInput.value);
});

// Helper to overwrite the field input value

function updateForm (result) {
  const fileData = result.filesUploaded[0];
  fileInput.value = fileData.url;
  
  // DOM code to show some data. 
  const name = document.createTextNode('Selected: ' + fileData.filename);
  const url = document.createElement('a');
  url.href = fileData.url;
  url.appendChild(document.createTextNode(fileData.url));
  nameBox.appendChild(name);
  urlBox.appendChild(document.createTextNode('Uploaded to: '));
  urlBox.appendChild(url);
};
*/

// import uploadcare from "uploadcare-widget/uploadcare.lang.en.min.js";

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set("view engine", "ejs"); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static("images")); // allows the use of static files

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

///////   API ROUTES    //////////

app.get("/", (req, res) => {
  // res.redirect("/login");
  res.render("pages/home");
});

app.get("/register", (req, res) => {
  res.render("pages/register");
});

// Register
app.post("/register", async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);
  //   res.redirect("/login");
  //   res.send(console.log("HERE"));
  //   res.send(req.body.password);

  const q = "INSERT INTO users VALUES ($1, $2) returning *;";
  //   const q = "SELECT * FROM users;";
  // To-DO: Insert username and hashed password into 'users' table
  db.any(q, [req.body.username, hash])
    .then((data) => {
      res.redirect("/login");
    })
    .catch((err) => {
      // console.log("MY ERROR", err);
      res.status(400).render("pages/register", {
        error: true,
        message: "Could not add username and password into database.",
      });
    });
});

app.get("/login", (req, res) => {
  res.render("pages/login");
});

app.post("/login", async (req, res) => {
  const q = "SELECT * FROM users WHERE username = $1;";
  db.any(q, [req.body.username])
    .then(async (data) => {
      if (data.length === 0) {
        //if username not found
        // res.status(400).render("pages/login", {
        //   error: true,
        //   message: "Username does not exist",
        // });
        // res.status(400).json({
        //   error: true,
        //   message: "Username does not exist",
        // });
        // .render("pages/login");

        res.status(400).render("pages/login", {
          error: true,
          message: "Username does not exist",
        });
      } else {
        let user = data[0];
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
          //if password matches
          req.session.user = user;
          req.session.save();
          res.status(200).redirect("/profile");
          // res.status(200).json({ status: "200", message: "Success" });
          // res.status(200).json({ message: "Success" }).redirect("/home");
        } else {
          //if password does not match
          res.status(400).render("pages/login", {
            error: true,
            message: "Username and password do not match.",
          });
        }
      }
    })
    .catch((err) => {
      //db query failed
      res.status(400).render("pages/login", {
        error: true,
        message: "Database query failed.",
      });
    });

  // res.status(400).json({
  //   error: true,
  //   message: "Username does not exist",
  // });
});

app.get("/profile", (req, res) => {
  var username;
  // if (isLoggedIn(req.session)) {
  if (req.session.hasOwnProperty("user")) {
    //case: logged in
    username = req.session.user.username;
  } else {
    //case: not logged in
    res.redirect("/login");
  }
  q =
    "SELECT name AS title, username, likes, dataLink AS link FROM StudyGuides LIMIT 5;";
  db.any(q, [])
    .then((data) => {
      // res.json(data);
      res.render("pages/profile", {
        username: username,
        uploaded: data,
        liked: [
          { title: "liked 1", link: "ll1" },
          { title: "liked 2", link: "ll2" },
        ],
      });
    })
    .catch((err) => {
      res.render("pages/profile", {
        username: username,
        uploaded: [
          { title: "upload 1", link: "ul1" },
          { title: "upload 2", link: "ul2" },
          { title: "upload 3", link: "ul3" },
          { title: "i guess 4", link: "ul4" },
        ],
        liked: [
          { title: "liked 1", link: "ll1" },
          { title: "liked 2", link: "ll2" },
        ],
      });
    });
});

app.get("/search", (req, res) => {
  res.render("pages/search");
});

app.get("/searchResults", (req, res) => {
  console.log(req.body, req.query);
  // SEARCH FORM RETURNS:
  // { }
  // {
  //     fileName: 'answers', -> StudyGuides name
  //     subject: 'engineering', -> ?
  //     lectureNotes: 'true', -> tags
  //     articles: 'true', -> tags
  //     nothing is returned for a checkbox that is not checked
  //     sortBy: 'ascending'
  // }

  // VARIABLES
  // req.query.fileName
  // req.query.subject
  // req.query.lectureNotes
  // req.query.articles
  // req.query.practiceTests
  // req.query.sortBy

  // QUERY
  var drop = "DROP VIEW IF EXISTS guideSearch;";
  var link =
    "CREATE VIEW guideSearch AS SELECT StudyGuides.name AS DocumentName, StudyGuides.likes AS DocumentRating, StudyGuides.datalink AS DocumentLink, tags.tag_name AS Tags FROM StudyGuides_to_Tags INNER JOIN StudyGuides ON StudyGuides_to_Tags.SG_id = StudyGuides.SG_id INNER JOIN tags ON StudyGuides_to_Tags.tag_id = tags.tag_id;";
  var find = "SELECT * FROM studyGuides WHERE (";

  // append appropriate values to query
  if (req.query.fileName != null) {
    find = find.concat(`DocumentName = '${req.query.fileName}' AND `);
  }

  if (req.query.subject != null) {
    find = find.concat(`DocumentSubject = '${req.query.subject}' AND `);
  }

  if (req.query.lectureNotes != null) {
    find = find.concat(`Tags = '${req.query.lectureNotes}' AND `);
  }

  if (req.query.articles != null) {
    find = find.concat(`Tags = '${req.query.articles}' AND `);
  }

  if (req.query.practiceTests != null) {
    find = find.concat(`Tags = '${req.query.practiceTests}' AND `);
  }

  // remove last instance of AND
  var last = find.lastIndexOf("AND");
  find = find.slice(0, last - 1);

  if (req.query.sortBy == "recent") {
    find = find.concat(");");
  }

  // sort query depending on input
  if (req.query.sortBy == "descending") {
    find = find.concat(`) SORT BY DocumentRating DESC;`);
  }

  if (req.query.sortBy == "ascending") {
    find = find.concat(`) SORT BY DocumentRating ASC;`);
  }

  db.task("get-everything", (task) => {
    return task.batch([task.any(drop), task.any(link), task.any(find)]);
  })
    .then((documents) => {
      // display search results if the docker containers are running
      console.log(documents);
      // render the search page and send the data
      res.render("pages/search", { documents: documents });
    })
    .catch((error) => {
      // handle errors
      res.render("pages/search", { documents: [], message: error });
      return console.log(err);
    });
});

app.get("/upload", (req, res) => {
  res.render("pages/upload");
});

app.get("/display", (req, res) => {
  res.render("pages/display", req.query);
});

// app.get("/displaytest", (req, res) => {
//   res.redirect(
//     "/display?title=Book Image&liked=5&url=https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.fineartamerica.com%2Fimages%2Fartworkimages%2Fmediumlarge%2F2%2Fold-books-in-library-shelf-luoman.jpg&f=1&nofb=1&ipt=7a103c7783084021ada777bf011494cfebd305db46c678d10ac2f64ab572f6fb&ipo=images"
//   );
// });

app.post("/like", (req, res) => {
  res.redirect("/display");
});

// app.post("/display", (req, res) => {
//   res.render("pages/display", req.query);
// });

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login", {
    error: false,
    message: "Logged out sucessfully",
  });
});

app.post("/tempUploadFile", (req, res) => {
  if (req.session.hasOwnProperty("user")) {
    username = req.session.user.username;
    q =
      "INSERT INTO StudyGuides (name, username, likes, dataLink) values ($1, $2, 0, $3) ;";
    db.any(q, [req.body.fileName, username, req.body.fileUrl])
      .then((data) => {
        mes = req.body.fileName + username;
        res.render("pages/upload", { message: "Uploaded Sucessfully!" + mes });
      })
      .catch((err) => {
        res.render("pages/upload", {
          error: true,
          message: "Failed to upload.",
        });
      });
  } else {
    res.redirect("/login");
  }
});

app.post("/uploadFile", (req, res) => {
  const { fileName, subject, fileURL} = req.body;
  const tags = req.body.tags;
  console.log("req.body.fileUrl : ", req.body.fileUrl);

  var username;
  // if (isLoggedIn(req.session)) {
  if (req.session.hasOwnProperty("user")) {
    //case: logged in
    username = req.session.user.username;
  } else {
    console.log("Test1");
    //message to tell them to login
    res.status(400).render("pages/login", {
      error: true,
      message: "Please Log In",
    });
  }

//   const tempImg =
//     "https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1024-512,f_auto,q_auto:best/streams/2013/January/130122/1B5672956-g-hlt-130122-puppy-1143a.jpg";

  const q =
    "INSERT INTO StudyGuides (name, username, likes, dataLink) VALUES ($1, $2, $3, $4) returning *;";

  db.any(q, [fileName, username, "0", req.body.fileUrl])
    .then((data) => {
      const SG_ID = data[0].sg_id;
      (async () => {
        if (tags) {
          for (const tag of tags) {
            console.log("Test4", tag, tags);
            await db
              .none(
                "INSERT INTO StudyGuides_to_Tags (SG_id, tag_id) VALUES ($1, $2)",
                [SG_ID, tag]
              )
              .then(() => {
                console.log("Tag inserted");
              })
              .catch((error) => console.error(error));
          }
          console.log("All tags inserted");
        } else {
          console.log("No tags to insert");
        }
      })();
    })



    .catch((err) => {
      console.log(err);
      res.status(400).render("pages/upload", {
        error: true,
        message: "Upload Failure",
      });
    });

	db.any("SELECT * FROM StudyGuides_to_Tags")
		.then((result) => {
		console.log("Data from StudyGuides_to_Tags:", result);
		})
		.catch((error) => {
		console.error(error);
		res.send("Error retrieving SG data");
	});

  	db.any("SELECT * FROM StudyGuides")
		.then((result) => {
		console.log("Data from StudyGuides:", result);
		mes = req.body.fileName + username;
        res.render("pages/upload", { message: "Uploaded Sucessfully!" + mes });
		})
		.catch((error) => {
		console.error(error);
		res.send("Error retrieving Tags data");
	});
});

app.get("/welcome", (req, res) => {
  res.json({ status: "success", message: "Welcome!" });
});

// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
// app.listen(3000);
console.log("Server is listening on port 3000");
