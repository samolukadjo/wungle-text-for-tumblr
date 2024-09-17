const development = true;

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
    callback;
  } else {
    document.addEventListener("load", () => {
      callback;
    });
  }
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

  setTimeout(proccessPostsContinuously, 2000);
}

// This function proccesses a single post by adding to it the functionalitty needed to see the wungle text
function proccessPost(postToProccess) {
  if (development) {
    console.log("[Wungle Text]: Processing post ", postToProccess);
  }

  if (postHasSomethingThatCouldBeWungled(postToProccess)) {
    const header = postToProccess.querySelector("header");
    const wungleTextButton = createAWungleTextButtonAndReturnIt();

    // Add the button to the header
    header.appendChild(wungleTextButton);

    if (development) {
      console.log("[Wungle Text]: Wungle Text button ", wungleTextButton);
    }

    const theApendedWungleTextButton = header.querySelector(
      ".wungle-text-button"
    );

    theApendedWungleTextButton.addEventListener("click", () => {
      switchWungleTextState(theApendedWungleTextButton, postToProccess);
    });
  }
}

// Check if the post has nothing that could be wungled
function postHasSomethingThatCouldBeWungled(postToProccess) {
  const wunglablePostContent = postToProccess.querySelectorAll(
    "p, h1, h2, li, blockquote"
  );
  const wunglablePostContentArray = Array.from(wunglablePostContent);

  if (development) {
    console.log(
      "[Wungle Text]: The lengtht of the array of wunglable content is ",
      wunglablePostContentArray.length
    );
  }

  if (wunglablePostContentArray.length == 0) {
    if (development) {
      console.log("[Wungle Text]: The post has nothing that could be wungled");
    }
    return false;
  }
  return true;
}

// Create the button element to be added to the header
function createAWungleTextButtonAndReturnIt() {
  const wungleTextButton = document.createElement("button");
  wungleTextButton.className = "wungle-text-button";
  wungleTextButton.style =
    "margin-left: 0.2rem; border: 1px solid " +
    (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "white"
      : "black") +
    "; height: 4rem; padding: 0.1rem 0.5rem 0.1rem 0.5rem; border-radius: 0.5rem; min-width: 6rem; line-height: 1.2rem; white-space: normal; word-wrap: break-word; background-color: " +
    (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "#333"
      : "white") +
    "; color: " +
    (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "white"
      : "black") +
    ";";
  wungleTextButton.textContent = "Wungle Text";
  return wungleTextButton;
}

function switchWungleTextState(theApendedWungleTextButton, postToProccess) {
  const postContentFields = postToProccess.querySelectorAll(
    ".GzjsW, .IxFyd:not(:has(>.GzjsW))"
  );
  const postContentFieldsArray = Array.from(postContentFields);

  if (development) {
    console.log(
      "[Wungle Text]: Array of post content fields ",
      postContentFieldsArray
    );
  }

  if (theApendedWungleTextButton.textContent == "Wungle Text") {
    postContentFieldsArray.forEach((postContentField) => {
      const contentElements = Array.from(
        postContentField.querySelectorAll("p, h1, h2, li, blockquote")
      );

      if (development) {
        console.log("[Wungle Text]: Content elements: ", contentElements);
      }

      contentElements.forEach((p) => {
        if (development) {
          console.log("[Wungle Text]: Processing paragraph ", p);
        }

        const theOriginalTextInTheParagraph = p.innerHTML;

        p.setAttribute("data-original", theOriginalTextInTheParagraph);

        if (development) {
          console.log(
            "[Wungle Text]: The text in the paragraph ",
            theOriginalTextInTheParagraph
          );
        }

        const containsWungleText = detect(p.innerHTML);

        console.log(
          "[Wungle Text]: Does the text '",
          p.innerHTML,
          "' contain wungle text?",
          containsWungleText
        );

        if (containsWungleText) {
          let decodedText = decode(p.innerHTML);

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

          p.innerHTML = decodedText;
        } else {
          if (development) {
            console.log(
              "[Wungle Text]: The paragraph to be made empty since theres no wungle text ",
              p.innerHTML
            );
          }

          p.innerHTML = ``;
        }
      });
    });

    theApendedWungleTextButton.textContent = "Show Original";
  } else if (theApendedWungleTextButton.textContent == "Show Original") {
    postContentFieldsArray.forEach((postContentField) => {
      const contentElements = Array.from(
        postContentField.querySelectorAll("p, h1, h2, li, blockquote")
      );

      if (development) {
        console.log("[Wungle Text]: Content elements: ", contentElements);
      }

      contentElements.forEach((p) => {
        if (development) {
          console.log("[Wungle Text]: Processing paragraph ", p);
        }

        const theOriginalTextInTheParagraph = p.getAttribute("data-original");
        p.innerHTML = theOriginalTextInTheParagraph;
      });

      theApendedWungleTextButton.textContent = "Wungle Text";
    });
  }
}
