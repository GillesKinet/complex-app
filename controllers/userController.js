const User = require("../models/User");

exports.login = function () {};

exports.logout = function () {};

exports.register = function (req, res) {
  let user = new User(req.body);
  console.log(req.body);
  // new creates a new object using the User constructor as a blueprint
  user.register();
  if (user.errors.length) {
    res.send(user.errors);
  } else {
    res.send("Congrats there are no errors.");
  }
};

exports.home = function (req, res) {
  res.render("home-guest");
};
