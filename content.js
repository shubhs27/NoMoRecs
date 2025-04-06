// Function to hide YouTube recommendations
function hideRecommendations() {
  // Check if we're on a YouTube video page
  if (window.location.pathname.includes("/watch")) {
    // Target the recommendations panel - YouTube's layout might change, so we use multiple selectors
    const selectors = [
      "div#secondary", // Main recommendations container
      "div#related", // Related videos
      "div#items.ytd-watch-next-secondary-results-renderer", // Another possible container
    ];

    selectors.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.display = "none";
      }
    });

    // Make the video player wider to fill the space
    const player = document.querySelector("div#primary");
    if (player) {
      player.style.maxWidth = "100%";
      player.style.width = "100%";
    }

    // Hide recommendations in theater mode as well
    const theaterContainer = document.querySelector(
      "div#player-theater-container"
    );
    if (theaterContainer) {
      theaterContainer.style.maxWidth = "100%";
      theaterContainer.style.width = "100%";
    }
  }

  // Hide recommendations ONLY on the YouTube homepage, NOT on subscriptions
  if (window.location.pathname === "/") {
    const homeRecommendations = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-shelf-renderer"
    );
    homeRecommendations.forEach((item) => {
      item.style.display = "none";
    });
  }
}

// Function to show recommendations
function showRecommendations() {
  // Restore video page recommendations
  if (window.location.pathname.includes("/watch")) {
    const selectors = [
      "div#secondary",
      "div#related",
      "div#items.ytd-watch-next-secondary-results-renderer",
    ];

    selectors.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.display = "";
      }
    });

    // Restore original player width
    const player = document.querySelector("div#primary");
    if (player) {
      player.style.maxWidth = "";
      player.style.width = "";
    }

    const theaterContainer = document.querySelector(
      "div#player-theater-container"
    );
    if (theaterContainer) {
      theaterContainer.style.maxWidth = "";
      theaterContainer.style.width = "";
    }
  }

  // Restore homepage recommendations
  if (window.location.pathname === "/") {
    const homeRecommendations = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-shelf-renderer"
    );
    homeRecommendations.forEach((item) => {
      item.style.display = "";
    });
  }
}

// Initialize MutationObserver
let observer;

// Function to setup observer
function setupObserver() {
  // Set up an observer to hide recommendations when the DOM changes
  // (YouTube uses a lot of AJAX to load content)
  observer = new MutationObserver(function () {
    chrome.storage.sync.get({ enabled: true }, function (data) {
      if (data.enabled) {
        hideRecommendations();
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Check storage to see if extension is enabled on page load
chrome.storage.sync.get({ enabled: true }, function (data) {
  if (data.enabled) {
    hideRecommendations();
  } else {
    showRecommendations();
  }
  setupObserver();
});

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggle") {
    if (request.enabled) {
      hideRecommendations();
    } else {
      showRecommendations();
    }
    // No page refresh needed
    sendResponse({ success: true });
  }
});
