const express = require("express");
const app = express();
const router = require("./router.js");

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

app.listen(3000);
