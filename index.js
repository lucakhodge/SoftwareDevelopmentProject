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

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************
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
      console.log("MY ERROR", err);
      res.render("pages/register", {
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
  //   const q = "SELECT * FROM users;";
  //   console.log(req.body.username);
  db.any(q, [req.body.username])
    .then(async (data) => {
      if (data.length === 0) {
        res.render("pages/login", {
          error: true,
          message: "Username does not exist",
        });
      } else {
        let user = data[0];
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
          req.session.user = user;
          req.session.save();
          res.redirect("/discover");
        } else {
          //throw error
          res.render("pages/login", {
            error: true,
            message: "Username and password do not match.",
          });
        }
        // res.send(user);
        res.render("pages/login", {
          error: true,
          message: "Database query failed.",
        });
      }
    })
    .catch((err) => {
      //   res.send(err);
      res.render("pages/login", {
        error: false,
        message: "Logged out sucessfully",
      });
    });
});

app.get("/discover", (req, res) => {
  if (req.session.hasOwnProperty("user")) {
    console.log("WE IN");
    axios({
      url: `https://app.ticketmaster.com/discovery/v2/events.json`,
      method: "GET",
      dataType: "json",
      headers: {
        "Accept-Encoding": "application/json",
      },
      params: {
        apikey: process.env.API_KEY,
        keyword: "soccer", //you can choose any artist/event here
        size: 10,
      },
    })
      .then((results) => {
        //   console.log(results.data); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
        //   console.log(results.data._embedded.events);
        res.render("pages/discover", results.data._embedded);
        //   res.render("pages/discover", { events: [] });
      })
      .catch((error) => {
        // Handle errors
        //   console.log(error);
        res.render("pages/discover", {
          events: [],
          error: true,
          message: "API call failed.",
        });
      });
  } else {
    res.render("pages/login", {
      error: false,
      message: "Log in to view Discover.",
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login", {
    error: false,
    message: "Logged out sucessfully",
  });
});

// TODO - Include your API routes here

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log("Server is listening on port 3000");
