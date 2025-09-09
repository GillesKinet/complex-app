const Post = require("../models/Post");

exports.viewCreateScreen = function (req, res) {
  res.render("create-post");
};

exports.create = function (req, res) {
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then(function (newId) {
      // newId comes from the Post.create function in the resolve statement info.insertedId)
      req.flash("success", "New post successfully created.");
      req.session.save(() => res.redirect(`/post/${newId}`));
    })
    .catch(function (errors) {
      errors.forEach((error) => {
        req.flash("errors", error);
      });
      req.session.save(() => res.redirect("/create-post"));
    });
};

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id);

    res.render("single-post-screen", { post: post, title: post.title });
  } catch {
    res.render("404");
  }
};

exports.viewEditScreen = async function (req, res) {
  exports.viewEditScreen = async function (req, res) {
    try {
      let post = await Post.findSingleById(req.params.id, req.visitorId);
      if (post.isVisitorOwner) {
        res.render("edit-post", { post: post });
      } else {
        req.flash(
          "errors",
          "You do not have permission to perform that action."
        );
        req.session.save(() => res.redirect("/"));
      }
    } catch {
      res.render("404");
    }
  };
};

exports.edit = function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);
  post
    .update()
    .then((status) => {
      // the post was succesfully updated in the database
      // user has the permission but there was a validation error
      if (status === "success") {
        // post was updated in db
        req.flash("success", "Post successully updated.");
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      } else {
        // user has permission but form errors
        post.errors.forEach((error) => {
          req.flash("errors", error);
        });
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      }
    })
    .catch(() => {
      // post with the request id doesn't exist
      // current visitor is not the owner of the requested post
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.delete = function (req, res) {
  Post.delete(req.params.id, req.visitorId)
    .then(() => {
      req.flash("success", "Post successfully deleted.");
      req.session.save(() => {
        res.redirect(`/profile/${req.session.user.username}`);
      });
    })
    .catch(() => {
      req.flash("errors", "You are not allowed to perform that action.");
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

exports.search = function (req, res) {
  Post.search(req.body.searchTerm)
    .then((posts) => {
      res.json(posts);
    })
    .catch(() => {
      res.json([]);
    });
};

exports.apiCreatePost = function (req, res) {
  let post = new Post(req.body, req.apiUser._id);
  post
    .create()
    .then(function (newId) {
      res.json("Post successfully created.");
    })
    .catch(function (errors) {
      res.json(errors);
    });
};

exports.apiDeletePost = function (req, res) {
  Post.delete(req.params.id, req.apiUser._id)
    .then(() => {
      res.json("Post succesfully deleted.");
    })
    .catch(() => {
      res.json("You do not have permission to perform that action.");
    });
};
