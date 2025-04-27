function hideRecommendations() {
  // Check if we're on a YouTube video page
  if (window.location.pathname.includes("/watch")) {
    const isPlaylist = new URLSearchParams(window.location.search).has("list");

    if (!isPlaylist) {
      // If not a playlist, hide all recommendations
      const selectors = [
        "div#secondary", // Main recommendations container
        "div#related",
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

      // Hide recommendations in theater mode
      const theaterContainer = document.querySelector(
        "div#player-theater-container"
      );

      if (theaterContainer) {
        theaterContainer.style.maxWidth = "100%";
        theaterContainer.style.width = "100%";
      }
    } else {
      // If it's a playlist, only hide recommended videos but keep playlist navigation
      // First show everything to ensure we can see the playlist
      showRecommendations();

      // Then find and hide only the recommendations section
      const recommendationsSection = document.querySelector(
        "div#items.ytd-watch-next-secondary-results-renderer"
      );

      if (recommendationsSection) {
        // Find all sections and hide only those that aren't part of the playlist
        const sections = recommendationsSection.querySelectorAll(
          "ytd-item-section-renderer"
        );

        sections.forEach((section) => {
          // Check if this section has playlist items
          const isPlaylistSection =
            section.querySelector("ytd-playlist-panel-renderer") !== null;

          if (!isPlaylistSection) {
            section.style.display = "none";
          }
        });
      }
    }
  }

  // Hide recommendations ONLY on the YT homepage, NOT on subscriptions
  if (window.location.pathname === "/") {
    const homeRecommendations = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-shelf-renderer"
    );

    homeRecommendations.forEach((item) => {
      item.style.display = "none";
    });
  }
}

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

    // Restore any hidden playlist sections
    const sections = document.querySelectorAll("ytd-item-section-renderer");

    sections.forEach((section) => {
      section.style.display = "";
    });
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

let observer; // Initialize MutationObserver

function setupObserver() {
  // Set up an observer to hide recommendations when the DOM changes as YT uses a lot of AJAX to load content
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

    sendResponse({ success: true }); // No page refresh needed
  }
});
