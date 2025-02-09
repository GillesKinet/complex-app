const usersCollection = require("../db").collection("Users");
const validator = require("validator");

let User = function (data) {
  this.data = data; // we are storing the data we got from the data parameter and storing it in a property we can access later
  this.errors = [];
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

  if (this.data.password.length > 100) {
    this.errors.push("Password cannot exceed 100 characters.");
  }

  if (this.data.username.length > 0 && this.data.username.length < 3) {
    this.errors.push("Username must be atleast 3 characters");
  }

  if (this.data.username.length > 30) {
    this.errors.push("Username cannot exceed 30 characters.");
  }
};

User.prototype.register = function () {
  // Step #1: Validate user data
  this.cleanUp();
  this.validate(); // so you are pointing to the object created in controller in particular this object => let user = new User(req.body);

  // step #2: Only if there are no validations errors, save the user data in the data base
  if (!this.errors.lenght) {
    usersCollection.insertOne(this.data);
  }
}; // a prototype, js will not need to create a copy once for each new object, all objects will have access to this method

module.exports = User;
