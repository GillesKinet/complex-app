export default class RegistrationForm {
  constructor() {
    this.allFields = document.querySelectorAll(
      "#registration-form .form-control"
    );
    this.insertValidationElements(
      (this.username = document.querySelector("#username-register"))
    );
    this.username.previousValue = "";
    this.events();
  }

  // Events
  events() {
    this.username.addEventListener("keyup", () => {
      this.isDifferent(this.username, this.userNameHandler);
    });
  }

  // Methods
  insertValidationElements() {
    this.allFields.forEach(function (el) {
      el.insertAdjacentHTML(
        "afterend",
        '<div class="alert alert-danger small liveValidateMessage liveValidateMessage--visible"></div>'
      );
    });
  }

  isDifferent(el, handler) {
    if (el.previousValue != el.value) {
      handler.call(this); // call is a method available to functions, call will run this function and set the this keyword to whatever we set it to (in this case the global object)
    }
    el.previousValue = el.Value;
  }

  userNameHandler() {
    alert("username handler just ran");
  }
}
