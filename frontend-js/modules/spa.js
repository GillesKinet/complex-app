async function navigateTo(desiredURL) {
  const ourPromise = await fetch(desiredURL);
  const data = await ourPromise.text();
  const ourParser = new DOMParser();
  const ourDoc = ourParser.parseFromString(data, "text/html");
  document.title = ourDoc.title;
  document.querySelector(".container--narrow").innerHTML =
    ourDoc.querySelector(".container--narrow").innerHTML;
}

function sameOrigin(a, b) {
  const urlA = new URL(a);
  const urlB = new URL(b);
  return urlA.origin === urlB.origin;
}

export default function () {
  document.addEventListener("click", function (element) {
    if (element.target.tagName === "A") {
      if (sameOrigin(element.target.href, window.location)) {
        element.preventDefault();
        navigateTo(element.target.href);
      }
    }
  });
}
