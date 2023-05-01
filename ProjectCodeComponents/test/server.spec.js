// Imports the index.js file to be tested.
<<<<<<< Updated upstream
const server = require("../index"); //TO-DO Make sure the path to your index.js is correctly added
=======
<<<<<<< HEAD
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
>>>>>>> Stashed changes
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe("Server!", () => {
  // Sample test case given to test / endpoint.
  it("Returns the default welcome message", (done) => {
    chai
      .request(server)
      .get("/welcome")
      .end((err, res) => {
        expect(res).to.have.status(200);
<<<<<<< Updated upstream
        expect(res.body.status).to.equals("success");
        assert.strictEqual(res.body.message, "Welcome!");
=======
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
=======
const server = require("../index"); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe("Server!", () => {
  // Sample test case given to test / endpoint.
  it("Returns the default welcome message", (done) => {
    chai
      .request(server)
      .get("/welcome")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals("success");
        assert.strictEqual(res.body.message, "Welcome!");
>>>>>>> 38fdd0f813e53f181c83f2b95c08c0e534a914ee
>>>>>>> Stashed changes
        done();
      });
  });

  // ===========================================================================
  // TO-DO: Part A Login unit test case
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
  // it('positive : /login', done => {
  //   chai
  //     .request(server)
  //     .post('/login')
  //     .send({username: 'John Doe', password: "123"})
  //     .end((err, res) => {
  //       expect(res).to.have.status(200);
  //       expect(res.body.message).to.equals('Success');
  //       done();
  //     });
  // });
>>>>>>> Stashed changes

  it("positive : /register", (done) => {
    chai
      .request(server)
      .post("/register")
      .send({username: "abc", password: "123" })
      .end((err, res) => {
<<<<<<< Updated upstream
        expect(res).to.have.status(200);
        // expect(res.body.message).to.equals("Success");
=======
        expect(res).to.have.status(400);
        expect(res.body.message).to.equals('Username does not exist');
=======

  it("positive : /register", (done) => {
    chai
      .request(server)
      .post("/register")
      .send({username: "abc", password: "123" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        // expect(res.body.message).to.equals("Success");
>>>>>>> 38fdd0f813e53f181c83f2b95c08c0e534a914ee
>>>>>>> Stashed changes
        done();
      });
  });

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
});
=======
>>>>>>> Stashed changes
  it("negative : /register", (done) => {
    chai
      .request(server)
      .post("/register")
      .send({ username: "abc", password: "123" })
      .end((err, res) => {
        expect(res).to.have.status(400);
        // expect(res.body.message).to.equals("Success");
        done();
      });
  });

  it("positive : /login", (done) => {
    chai
      .request(server)
      .post("/login")
      .send({ username: "abc", password: "123" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        // expect(res.body.message).to.equals("Success");
        done();
      });
  });

  it("Negative : /login. Checking invalid name", (done) => {
    chai
      .request(server)
      .post("/login")
      .send({ id: "5", name: 10, dob: "2020-02-20" })
      .end((err, res) => {
        expect(res).to.have.status(400);
        // expect(res.body.message).to.equals("Username does not exist");
        // expect(res.text).to.include("Username does not exist");
        // expect(res.locals.message).to.equals("Username does not exist");
        done();
});
  });
});
<<<<<<< Updated upstream
=======
>>>>>>> 38fdd0f813e53f181c83f2b95c08c0e534a914ee
>>>>>>> Stashed changes
