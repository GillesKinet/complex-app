const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");

// user related routes

router.get("/", userController.home);

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/logout", userController.logout);

router.get("/about", function (req, res) {
  res.send("This is our about page");
});

// post related routes

router.get(
  "/create-post",
  userController.mustBeLoggedIn, // to make sure the user is logged in to view the screen
  postController.viewCreateScreen
);

router.post(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.create
);

router.get("/post/:id", postController.viewSingle);

module.exports = router;
