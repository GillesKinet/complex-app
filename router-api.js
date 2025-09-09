const apiRouter = require("express").Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const followController = require("./controllers/followController");

apiRouter.post("/login", userController.apiLogin);

apiRouter.post(
  "/create-post",
  userController.apiMustBeloggedIn,
  postController.apiCreatePost
);

module.exports = apiRouter;
