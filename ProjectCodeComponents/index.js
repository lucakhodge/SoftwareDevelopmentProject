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
  res.send("pages/home");
});

app.get("/upload", (req, res) => {
  res.render("pages/upload");
});


///pdf shows up as undefined through postman

app.post("/upload", (req, res) => {
  console.log(req.files);
  axios("https://www.filestackapi.com/api/store/S3?key=API_KEY", {
    method:'POST',
    header:{ "Content-Type": "image/png" },
    body: req.files.data,
  }
  ).then((r)=>{
    console.log(r);
    res.json(r);
  }).catch((e) => console.log(e));
})



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
app.use(express.static('images')) // allows the use of static files

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
    // username = "NOT LOGGED IN";
    res.redirect("/login");
  }
  res.render("pages/profile", {
    username: username,
    uploaded: [
      { title: "upload 1", link: "ul1" },
      { title: "upload 2", link: "ul2" },
      { title: "upload 3", link: "ul3" },
    ],
    liked: [
      { title: "liked 1", link: "ll1" },
      { title: "liked 2", link: "ll2" },
    ],
  });
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

app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
// app.listen(3000);
console.log("Server is listening on port 3000");
