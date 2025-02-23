const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const app = express();
const router = require("./router.js");

let sessionOptions = session({
  secret: "Javascript is so cool",
  store: MongoStore.create({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, sameSite: "strict" }, // how long coockie for a session should be valid
  //  sameSite: "strict" makes you safe for CSRF attacks
});

// use sessions
app.use(sessionOptions);

// boilerplate code, tells express to add users submitted data to route
app.use(express.urlencoded({ extended: false })); // HTML form submit
app.use(express.json()); // json data

// here we are going to use css
app.use(express.static("public"));
// end

// this allows us to use the HTML templates
app.set("views", "views"); // accesss the views
app.set("view engine", "ejs"); // npm install ejs to install
// end

app.use("/", router);

module.exports = app;
