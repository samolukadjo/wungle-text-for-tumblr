const development = false;

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
  header.innerHTML += `<button class="wungle-text-button" style="margin-left: 0.2rem; border: 1px solid black; height: 1.5rem; padding: 0.5rem; border-radius: 0.5rem; min-width: 7rem;">Wungle Text</button>`;
  header.querySelector(".wungle-text-button").addEventListener("click", () => {
    alert("You clicked the button!");
  });
}

// This function checks for new posts and proccesses them,
//it also checks for new posts containers and proccesses posts within those as well
// This may need to be broken up into multiple functions
function proccessPostsContinuously() {
  // Select the node that will be observed for mutations
  let postsContainers = Array.from(document.querySelectorAll(".zAlrA"));
  const postsContainer = postsContainers[0];

  if (development) {
    console.log("[Wungle Text]: Posts containers detected ", postsContainers);
    console.log("[Wungle Text]: First posts container ", postsContainer);
  }

  let firstPosts = detectPosts(postsContainer);

  for (let i = 0; i < firstPosts.length; i++) {
    proccessPost(firstPosts[i]);
  }

  postsThatWereAlreadyProcessed =
    postsThatWereAlreadyProcessed.concat(firstPosts);

  // Options for the observer (which mutations to observe)
  const config = { attributes: false, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        if (development) {
          console.log("A posts feed has changed.", mutation);
        }
        let currentPosts = detectPosts(mutation.target);

        const difference = currentPosts.filter(
          (element) => !postsThatWereAlreadyProcessed.includes(element)
        );

        if (development) {
          console.log("[Wungle Text]: The diferences are ", difference);
        }

        for (let i = 0; i < difference.length; i++) {
          proccessPost(difference[i]);
        }

        postsThatWereAlreadyProcessed =
          postsThatWereAlreadyProcessed.concat(difference);
      }
    }

    // This doesnt work yet, it thinks the feeds its already detected are new
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(postsContainer, config);

  // Later, you can stop observing
  // observer.disconnect();

  // This function checks for new posts feeds and starts proccessesing on their posts as well
  checkForNewPostFeedsAndObserveThem();

  function checkForNewPostFeedsAndObserveThem() {
    const currentPostsContainers = Array.from(
      document.querySelectorAll(".zAlrA")
    );
    if (!currentPostsContainers.equals(postsContainers)) {
      if (development) {
        console.log(
          "[Wungle Text]: New feed of posts detected.",
          "Old posts feeds list: ",
          postsContainers,
          "New posts feeds list: ",
          currentPostsContainers
        );
      }

      const difference = currentPostsContainers.filter(
        (element) => !postsContainers.includes(element)
      );

      for (let i = 0; i < difference.length; i++) {
        observer.observe(difference[i], config);
      }

      postsContainers = postsContainers.concat(difference);

      setTimeout(checkForNewPostFeedsAndObserveThem, 1000);
    } else {
      if (development) {
        console.log("[Wungle Text]: No new feed of posts detected.");
      }
      setTimeout(checkForNewPostFeedsAndObserveThem, 1000);
    }
  }
}
