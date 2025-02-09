let User = function (data) {
  this.data = data; // we are storing the data we got from the data parameter and storing it in a property we can access later
  this.errors = [];
};

User.prototype.validate = function () {
  if (this.data.username == "") {
    this.errors.push("You must provide a username.");
  }
  if (this.data.email == "") {
    this.errors.push("You must provide a valid e-mailadres.");
  }
  if (this.data.password == "") {
    this.errors.push("You must provide a password.");
  }
};

User.prototype.register = function () {
  // Step #1: Validate user data
  this.validate(); // so you are pointing to the object created in controller in particular this object => let user = new User(req.body);
  // step #2: Only if there are no validations errors, save the user data in the data base
}; // a prototype, js will not need to create a copy once for each new object, all objects will have access to this method

module.exports = User;
