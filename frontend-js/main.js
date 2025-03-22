import Search from "./modules/search";

new Search();

if (document.querySelector(".header-search-icon")) {
  // this code is for browsers that might be slower
  new Search();
}
