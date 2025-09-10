const Post = require("../models/Post");
const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRIDAPIKEY);

exports.viewCreateScreen = function (req, res) {
  res.render("create-post");
};

exports.create = async function (req, res) {
  let post = new Post(req.body, req.session.user._id);
  try {
    const newId = await post.create();
    await sendgrid.send({
      to: "testemailhyperkinet@mailinator.com",
      from: "testemailhyperkinet@mailinator.com",
      subject: "Congrats on creating a new post",
      text: "You did it great job at creating a post",
      html: "You did it <bold>great</bold> job at creating a post",
    });
    // newId comes from the Post.create function in the resolve statement info.insertedId)
    req.flash("success", "New post successfully created.");
    req.session.save(() => res.redirect(`/post/${newId}`));
  } catch (errors) {
    errors.forEach((error) => {
      req.flash("errors", error);
    });
    req.session.save(() => res.redirect("/create-post"));
  }
};

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);

    res.render("single-post-screen", { post: post, title: post.title });
  } catch {
    res.render("404");
  }
};

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    if (post.isVisitorOwner) {
      res.render("edit-post", { post: post });
    } else {
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(() => res.redirect("/"));
    }
  } catch {
    res.render("404");
  }
};

exports.edit = async function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);
  try {
    const status = await post.update();
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
  } catch (errors) {
    // post with the request id doesn't exist
    // current visitor is not the owner of the requested post
    req.flash("errors", "You do not have permission to perform that action.");
    req.session.save(function () {
      res.redirect("/");
    });
  }
};

exports.delete = async function (req, res) {
  try {
    await Post.delete(req.params.id, req.visitorId);
    req.flash("success", "Post successfully deleted.");
    req.session.save(() => {
      res.redirect(`/profile/${req.session.user.username}`);
    });
  } catch (e) {
    req.flash("errors", "You are not allowed to perform that action.");
    req.session.save(() => {
      res.redirect("/");
    });
  }
};

exports.search = async function (req, res) {
  try {
    const posts = await Post.search(req.body.searchTerm);
    res.json(posts);
  } catch (errors) {
    res.json([]);
  }
};

exports.apiCreatePost = async function (req, res) {
  let post = new Post(req.body, req.apiUser._id);
  try {
    const newId = await post.create();
  } catch (errors) {
    res.json(errors);
  }
};

exports.apiDeletePost = async function (req, res) {
  try {
    await Post.delete(req.params.id, req.apiUser._id);
    res.json("Post succesfully deleted.");
  } catch (errors) {
    res.json("You do not have permission to perform that action.");
  }
};
