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
const cloudinary = require("cloudinary").v2;

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

//Cloudinary API:

//configuration
cloudinary.config({
  cloud_name: "dfx20hhlk",
  api_key: "676725369999912",
  api_secret: "cISXL5XpemBW1clvfGWWUJe1mqg",
});

const res = cloudinary.uploader.upload(
  "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }
);

res
  .then((data) => {
    console.log(data);
    console.log(data.secure_url);
  })
  .catch((err) => {
    console.log(err);
  });

// Generate
const url = cloudinary.url("olympic_flag", {
  width: 100,
  height: 150,
  Crop: "fill",
});

// The output url
console.log(url);
// https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/olympic_flag

//Uploadcare:

// import uploadcare from "uploadcare-widget/uploadcare.lang.en.min.js";

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set("view engine", "ejs"); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

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
  res.redirect("/login");
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
  res.render("pages/profile");
});

app.get("/search", (req, res) => {
  res.render("pages/search");
});

// EXAMPLE GET API CALL

// app.get("/search-results", (req, res) => {
//     VARIABLES
//     req.body.file-name
//     req.body.subject
//     req.body.lecture-notes
//     req.body.articles
//     req.body.practice-tests
//     req.body.sort-by
// });

// app.get("/search_trails", function (req, res) {
// var search = "SELECT * FROM trails WHERE (";

// if (req.query.location != null) {
// 	search = search.concat(`location = '${req.query.location}' AND `);
// }

// if (req.query.elevation_gain != null) {
// 	search = search.concat(`elevation_gain = ${req.query.elevation_gain} AND `);
// }

// if (req.query.difficulty != null) {
// 	search = search.concat(`difficulty = '${req.query.difficulty}' AND `);
// }

// if (req.query.avg_rating != null) {
// 	search = search.concat(`avg_rating = ${req.query.avg_rating} AND `);
// }

// var last = search.lastIndexOf("AND");
// search = search.slice(0, last - 1);
// search = search.concat(");");

// console.log(search);

// db.any(search)
//     .then((data) => {
//         res.status(201).json({
// 		status: "search success",
// 			trails: data,
// 		});
// 	})
// 	.catch(function (err) {
// 		return console.log(err);
// 	});
// });

app.get("/upload", (req, res) => {
  res.render("pages/upload");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login", {
    error: false,
    message: "Logged out sucessfully",
  });
});

app.get("/welcome", (req, res) => {
  res.json({ status: "success", message: "Welcome!" });
});

// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
// app.listen(3000);
console.log("Server is listening on port 3000");
