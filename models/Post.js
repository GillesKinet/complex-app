const postsCollection = require("../db").db().collection("post"); //this file exports the mongo db client
const ObjectID = require("mongodb").ObjectId;
const User = require("../models/User");
const sanitizeHTML = require("sanitize-html");

let Post = function (data, userid, requestedPostId) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
  this.requestedPostId = requestedPostId;
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      // save post into database since
      postsCollection
        .insertOne(this.data)
        .then((info) => {
          resolve(info.insertedId);
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

Post.prototype.update = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userid);
      if (post.isVisitorOwner) {
        let status = await this.actuallyUpdate();
        resolve(status);
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Post.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.lenght) {
      await postsCollection.findOneAndUpdate(
        {
          _id: new ObjectID(this.requestedPostId),
        },
        { $set: { title: this.data.title, body: this.data.body } }
      );
      resolve("success");
    } else {
      resolve("failure");
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
    title: sanitizeHTML(this.data.title.trim(), {
      allowedTags: [], // allow none
      allowedAttributes: {}, // allow none
    }),
    body: sanitizeHTML(this.data.body.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
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

Post.reusablePostQuery = function (
  uniqueOperations,
  visitorId,
  finalOperations = []
) {
  //
  return new Promise(async function (resolve, reject) {
    let aggOperations = uniqueOperations
      .concat([
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
            authorId: "$author",
            author: { $arrayElemAt: ["$authorDocument", 0] }, // returns first item in the array provided by $lookup
          },
        },
      ])
      .concat(finalOperations); // returns a new array

    let posts = await postsCollection.aggregate(aggOperations).toArray(); // use aggregates when you need to perform multiple actions e.g get the id of the post and get the id of the author

    // clean up author property in each post object
    posts = posts.map(function (post) {
      post.isVisitorOwner = post.authorId.equals(visitorId);
      post.authorId = undefined;
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar,
      };
      return post;
    });
    resolve(posts);
  });
};

Post.findSingleById = function (id, visitorId) {
  //
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      //!!! type of very import to not allow an injection attack, a user could send an object here for example
      reject();
      return; // this return is added to prevent any further execution of the function
    }

    let posts = await Post.reusablePostQuery(
      [
        {
          $match: { _id: new ObjectID(id) },
        },
      ],
      visitorId
    );

    if (posts.length) {
      resolve(posts[0]); // return first item in array
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function (authorId) {
  return Post.reusablePostQuery([
    {
      $match: {
        author: authorId,
      },
    },
    {
      $sort: {
        createdDate: -1, // 1 for ascending -1 for descending
      },
    },
  ]);
};

Post.delete = function (postIdToDelete, currentUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(postIdToDelete, currentUserId);
      if (post.isVisitorOwner) {
        await postsCollection.deleteOne({ _id: new ObjectID(postIdToDelete) });
        resolve();
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Post.search = function (searchTerm) {
  return new Promise(async (resolve, reject) => {
    if (typeof searchTerm === "string") {
      let posts = await Post.reusablePostQuery(
        [{ $match: { $text: { $search: searchTerm } } }],
        undefined,
        [{ $sort: { score: { $meta: "textScore" } } }]
      );
      resolve(posts);
    } else {
      reject();
    }
  });
};

Post.countPostsByAuthor = function (id) {
  return new Promise(async (resolve, reject) => {
    let postCount = await postsCollection.countDocuments({ author: id });
    resolve(postCount);
  });
};

module.exports = Post;
