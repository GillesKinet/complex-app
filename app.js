const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const markdown = require("marked");
const app = express();
const router = require("./router.js");
const sanitizeHTML = require("sanitize-html");

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
app.use(flash());

app.use(function (req, res, next) {
  // make all error and success flash messages available from all templates
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");

  // make our markdown function available from within ejs templates
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(markdown.parse(content), {
      allowedTags: [
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "strong",
        "bold",
        "i",
        "em",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
      allowedAttributes: {},
    });
  };

  res.locals.user = req.session.user; //object that will be available within ejs templates so its no longer needed in the controllers
  // example home-dashboard.ejs file at line 5
  // example header.ejs on line 20
  // make current user id avialable on the req object
  req.session.user
    ? (req.visitorId = req.session.user._id)
    : (req.visitorId = 0);

  // make user session data available frorm within view templates
  next();
});

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
