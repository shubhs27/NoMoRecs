// Set default state when extension is installed
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ enabled: true }, function () {
    console.log("NoMoRecs extension installed with default state: enabled");
  });
});

// Handle tabs being updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("youtube.com")
  ) {
    // Check if extension is enabled
    chrome.storage.sync.get({ enabled: true }, function (data) {
      if (data.enabled) {
        // Send message to content script to hide recommendations
        chrome.tabs.sendMessage(
          tabId,
          {
            action: "toggle",
            enabled: true,
          },
          function (response) {
            // Handle potential error if content script is not ready
            if (chrome.runtime.lastError) {
              console.log("Error sending message:", chrome.runtime.lastError);
            }
          }
        );
      }
    });
  }
});
