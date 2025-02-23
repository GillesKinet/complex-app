const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");

router.get("/", userController.home);

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/logout", userController.logout);

router.get("/about", function (req, res) {
  res.send("This is our about page");
});

module.exports = router;
