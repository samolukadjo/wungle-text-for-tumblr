const development = true;

console.log("Wungle text here:", encode("Hello World {wungle text ends here}"));

// Define the functionality needed to compare arrays
// Warn if overriding existing method
if (Array.prototype.equals) {
  if (development) {
    console.warn(
      "[Wungle Text]: Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code."
    );
  }
}
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array) return false;
  // if the argument is the same array, we can be sure the contents are same as well
  if (array === this) return true;
  // compare lengths - can save a lot of time
  if (this.length != array.length) return false;

  for (var i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i])) return false;
    } else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });

// A global scope variable to keep track of the posts that were already proccessed
let postsThatWereAlreadyProcessed = [];

// The function that runs when the page is loaded
main();
function main() {
  if (development) {
    console.log(
      "[Wungle Text]: Hello from the content_script.js of the Wungle text extension!"
    );
  }

  runOnLoaded(proccessPostsContinuously());
}

// This function runs the callback function once the page is loaded
function runOnLoaded(callback) {
  if (document.readyState == "complete") {
    return callback();
  } else {
    let result;
    document.addEventListener("DOMContentLoaded", () => {
      result = callback();
    });

    return result;
  }
}

// This function returns an array of all the posts in the supplied post container at the time of the call
function detectPosts(containerOfPostsToProccess) {
  const posts = containerOfPostsToProccess.querySelectorAll(".zAlrA article");

  if (development) {
    console.log("[Wungle Text]: Posts detected ", posts);
  }

  return Array.from(posts);
}

// This function proccesses a single post by adding to it the functionalitty needed to see the wungle text
// It also adds a button and attaches an event listener to the button which executes a function
//that curentlly shows an alert but which will find and show the wungle text
function proccessPost(postToProccess) {
  if (development) {
    console.log("[Wungle Text]: Processing post ", postToProccess);
  }

  const header = postToProccess.querySelector("header");
  const postContentFields = postToProccess.querySelectorAll(".GzjsW");
  const lastPostContentField = postContentFields[postContentFields.length - 1];

  console.log("[Wungle Text]: Last post content field ", lastPostContentField);

  header.innerHTML += `<button class="wungle-text-button" style="margin-left: 0.2rem; border: 1px solid ${window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black"}; height: 1.5rem; padding: 0.5rem; border-radius: 0.5rem; min-width: 7rem; background-color: ${window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "#333" : "white"}; color: ${window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black"};">Wungle Text</button>`;
  header.querySelector(".wungle-text-button").addEventListener("click", () => {
    lastPostContentField.querySelectorAll("p").forEach((p) => {
      if (development) {
        console.log("[Wungle Text]: Processing paragraph ", p);
      }

      let theTextInTheParagraph = p.textContent;

      if (development) {
        console.log(
          "[Wungle Text]: The text in the paragraph ",
          theTextInTheParagraph
        );
      }

      const containsWungleText = detect(theTextInTheParagraph);

      if (containsWungleText) {
        let decodedText = decode(theTextInTheParagraph);

        if (development) {
          console.log(
            "[Wungle Text]: The decoded text in the paragraph ",
            decodedText
          );
        }

        const regex = /{wungle text ends here}/;
        const match = regex.exec(decodedText);

        if (match) {
          decodedText = decodedText.slice(0, match.index);
        }

        p.textContent = `${decodedText}`;
      } else {
        p.textContent = ``;
      }

      console.log(
        "[Wungle Text]: Does the text '",
        theTextInTheParagraph,
        "' contain wungle text?",
        containsWungleText
      );
    });
  });
}

// Check for new posts every certain time interval and proccess them
function proccessPostsContinuously() {
  const posts = Array.from(document.querySelectorAll(".zAlrA article"));

  if (development) {
    console.log("[Wungle Text]: Posts detected ", posts);
  }

  for (let i = 0; i < posts.length; i++) {
    if (development) {
      console.log("[Wungle Text]: Processing post ", posts[i]);
      console.log(
        "[Wungle Text]: Is post already processed ",
        postsThatWereAlreadyProcessed.includes(posts[i])
      );
    }
    if (!postsThatWereAlreadyProcessed.includes(posts[i])) {
      proccessPost(posts[i]);
      postsThatWereAlreadyProcessed.push(posts[i]);
    }
  }

  setTimeout(proccessPostsContinuously, 1000);
}
