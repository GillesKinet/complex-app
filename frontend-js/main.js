import Search from "./modules/search";

import Chat from "./modules/chat";

import RegistrationForm from "./modules/registrationForm";

if (document.querySelector("#registration-form")) {
  new RegistrationForm();
}

new Search();

if (document.querySelector(".header-search-icon")) {
  // this code is for browsers that might be slower
  new Search();
}

if (document.querySelector("#chat-wrapper")) {
  new Chat();
}
