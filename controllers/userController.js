const User = require("../models/User");

exports.login = function (req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(function (result) {
      req.session.user = { username: user.data.username }; // request object with session object, unique per user
      res.send(result);
    })
    .catch(function (err) {
      res.send(err);
    });
  // then takes care of resolve
  // catch takes care of reject
};

exports.logout = function () {};

exports.register = function (req, res) {
  let user = new User(req.body);
  // new creates a new object using the User constructor as a blueprint
  user.register();
  if (user.errors.length) {
    res.send(user.errors);
  } else {
    res.send("Congrats there are no errors.");
  }
};

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    res.render("home-guest");
  }
};
