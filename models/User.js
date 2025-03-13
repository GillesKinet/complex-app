const usersCollection = require("../db").db().collection("Users");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const md5 = require("md5");

let User = function (data, getAvatar) {
  this.data = data; // we are storing the data we got from the data parameter and storing it in a property we can access later
  this.errors = [];
  if (getAvatar == undefined) {
    {
      getAvatar = false;
    }
  }
  if (getAvatar) {
    this.getAvatar();
  }
};

// the function below is so people dont add arrays or objects to the corresponding fields
User.prototype.cleanUp = function () {
  if (typeof this.data.username != "string") {
    this.data.username = "";
  }
  if (typeof this.data.email != "string") {
    this.data.email = "";
  }
  if (typeof this.data.password != "string") {
    this.data.password = "";
  }

  // get rid of any bogus properties that a user would send e.g. via direct api request -> sanitizes the data
  this.data = {
    username: this.data.username.trim().toLowerCase(), // removes empty spaces
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

User.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    if (this.data.username == "") {
      this.errors.push("You must provide a username.");
    }

    if (
      this.data.username != "" &&
      !validator.isAlphanumeric(this.data.username)
    ) {
      this.errors.push("Username can only contain letter and numbers");
    }

    if (!validator.isEmail(this.data.email)) {
      this.errors.push("You must provide a valid e-mailadres.");
    }

    if (this.data.password == "") {
      this.errors.push("You must provide a password.");
    }

    if (this.data.password.length > 0 && this.data.password.length < 12) {
      this.errors.push("Password must be atleast 12 characters");
    }

    if (this.data.password.length > 50) {
      this.errors.push("Password cannot exceed 50 characters.");
    }

    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push("Username must be atleast 3 characters");
    }

    if (this.data.username.length > 30) {
      this.errors.push("Username cannot exceed 30 characters.");
    }

    // Only if user name is valid then check to see if it's already taken
    if (
      this.data.username.length > 2 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username)
    ) {
      let usernameExists = await usersCollection.findOne({
        username: this.data.username,
      });
      if (usernameExists) {
        this.errors.push("That username is already taken");
      }
    }
    // Only if email is valid then check to see if it's already taken
    if (validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({
        email: this.data.email,
      });
      if (emailExists) {
        this.errors.push("That e-mailaddress is already being used");
      }
    }
    resolve();
  });
};

User.prototype.login = function () {
  // very important to use an arrow function here as it does not manipulate the this keyword!!!!
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    const attemptedUser = await usersCollection.findOne({
      username: this.data.username,
    });
    if (
      attemptedUser &&
      bcrypt.compareSync(this.data.password, attemptedUser.password)
    ) {
      // this.data.password will be compared to the hashed value that is in the database\
      // hashed value is attemptedUser.password
      this.data = attemptedUser;
      this.getAvatar();
      resolve("Congrats");
    } else {
      reject("Invalid username/password");
    }
  });
};

User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    // we use an arrow function since it does not change the value of the this.object!!
    // Step #1: Validate user data
    this.cleanUp();
    await this.validate(); // so you are pointing to the object created in controller in particular this object => let user = new User(req.body);

    // step #2: Only if there are no validations errors, save the user data in the data base
    if (!this.errors.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      usersCollection.insertOne(this.data);
      this.getAvatar();
      resolve();
    } else {
      reject(this.errors);
    }
  });
}; // a prototype, js will not need to create a copy once for each new object, all objects will have access to this method

User.prototype.getAvatar = function () {
  this.avatar = `https://s.gravatar.com/avatar/${md5(this.data.email)}?s=128`;
};

User.findByUsername = function (username) {
  return new Promise(function (resolve, reject) {
    if (typeof username != "string") {
      reject();
      return;
    }
    usersCollection
      .findOne({ username: username })
      .then(function (userDoc) {
        if (userDoc) {
          userDoc = new User(userDoc, true); // here we create a a new user document based on the data we get from the db
          userDoc = {
            _id: userDoc.data.id,
            username: userDoc.data.username,
            avatar: userDoc.avatar,
          };
          resolve(userDoc);
        } else {
          reject();
        }
      })
      .catch(function () {
        reject();
      });
  });
};

module.exports = User;
