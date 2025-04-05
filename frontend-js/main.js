import Search from "./modules/search";

import Chat from "./modules/chat";

new Search();

if (document.querySelector(".header-search-icon")) {
  // this code is for browsers that might be slower
  new Search();
}

if (document.querySelector("#chat-wrapper")) {
  new Chat();
}
