// Put all the javascript code here, that you want to execute after page load.
let postsThatWereAlreadyProcessed = [];

init();
function init() {
  console.log(
    "[Wungle Text]: Hello from the content_script.js of the Wungle text extension!"
  );

  runOnLoaded(proccessPostsContinuously());
}

// This function runs whatever code is in the callback function once the page is loaded
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

// This function returns an array of all the posts on the page at the time of the call
function detectPosts() {
  const posts = document.querySelectorAll(".zAlrA article");

  console.log("[Wungle Text]:", posts);

  return Array.from(posts);
}

function proccessPost(postToProccess) {
  console.log("[Wungle Text]: Processing post ", postToProccess);
}

function proccessPostsContinuously() {
  // Select the node that will be observed for mutations
  let postsContainers = Array.from(document.querySelectorAll(".zAlrA"));
  const postsContainer = postsContainers[0];

  // Options for the observer (which mutations to observe)
  const config = { attributes: false, childList: true, subtree: false };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        console.log("New posts have been loaded.");
        let currentPosts = detectPosts();

        const difference = currentPosts.filter(
          (element) => !postsThatWereAlreadyProcessed.includes(element)
        );

        console.log("[Wungle Text]: The diferences are ", difference);

        for (let i = 0; i < difference.length; i++) {
          proccessPost(difference[i]);
        }

        postsThatWereAlreadyProcessed =
          postsThatWereAlreadyProcessed.concat(difference);
      }
    }

    // This doesnt work yet, it thinks the feeds its already detected are new
    // checkForNewPostFeedsAndObserveThem();

    function checkForNewPostFeedsAndObserveThem() {
      if (Array.from(document.querySelectorAll(".zAlrA")) !== postsContainers) {
        console.log("[Wungle Text]: New feed of posts detected.", "Old posts feeds list: ", postsContainers, "New posts feeds list: ", Array.from(document.querySelectorAll(".zAlrA")));

        const difference = Array.from(
          document.querySelectorAll(".zAlrA")
        ).filter((element) => !postsContainers.includes(element));

        for (let i = 0; i < difference.length; i++) {
            observer.observe(difference[i], config);
        }

        postsContainers = postsContainers.concat(difference);

        setTimeout(checkForNewPostFeedsAndObserveThem, 1000);
      } else {
        console.log("[Wungle Text]: No new feed of posts detected.");
        setTimeout(checkForNewPostFeedsAndObserveThem, 1000);
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(postsContainer, config);

  // Later, you can stop observing
  // observer.disconnect();
}
