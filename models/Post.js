const postsCollection = require("../db").db().collection("post"); //this file exports the mongo db client
const ObjectID = require("mongodb").ObjectId;
const User = require("../models/User");

let Post = function (data, userid) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      // save post into database since
      postsCollection
        .insertOne(this.data)
        .then(() => {
          resolve();
        })
        .catch(() => {
          this.errors.push(
            "Please try again later, there might be an issue with the Mongo db sever"
          );
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != "string") {
    this.data.title = "";
  }
  if (typeof this.data.body != "string") {
    this.data.title = "";
  }
  // get rid of any bogus properties that a user would want to add on the object
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate: new Date(), //
    author: ObjectID(this.userid),
  };
};

Post.prototype.validate = function () {
  if (this.data.title == "") {
    this.errors.push("You must provide a title.");
  }
  if (this.data.body == "") {
    this.errors.push("You must provide a body.");
  }
};

Post.findSingleById = function (id) {
  //
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      //!!! type of very import to not allow an injection attack, a user could send an object here for example
      reject();
      return; // this return is added to prevent any further execution of the function
    }
    let posts = await postsCollection
      .aggregate([
        {
          $match: { _id: new ObjectID(id) },
        },
        {
          $lookup: {
            from: "Users",
            localField: "author",
            foreignField: "_id",
            as: "authorDocument",
          }, // look in users collection for the author field
        },
        {
          $project: {
            // allows which fields resulting object should have - so you dont get them all
            title: 1, // 1 = true
            body: 1,
            createdDate: 1,
            author: { $arrayElemAt: ["$authorDocument", 0] }, // returns first item in the array provided by $lookup
          },
        },
      ])
      .toArray(); // use aggregates when you need to perform multiple actions e.g get the id of the post and get the id of the author

    // clean up author property in each post object
    posts = posts.map(function (post) {
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar,
      };
      return post;
    });

    if (posts.length) {
      resolve(posts[0]); // return first item in array
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function (authorId) {};

module.exports = Post;
