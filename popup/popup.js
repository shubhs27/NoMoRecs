document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggle");
  const statusText = document.getElementById("status");

  chrome.storage.sync.get({ enabled: true }, function (data) {
    toggleButton.checked = data.enabled;
    updateStatusText(data.enabled);
  });

  // Handle toggle changes
  toggleButton.addEventListener("change", function () {
    const isEnabled = toggleButton.checked;

    chrome.storage.sync.set({ enabled: isEnabled }, function () {
      updateStatusText(isEnabled);

      // Send message to content script to apply changes
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].url.includes("youtube.com")) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "toggle",
              enabled: isEnabled,
            },
            function (response) {
              console.log("Toggle response:", response);
            }
          );
        }
      });
    });
  });

  function updateStatusText(enabled) {
    statusText.textContent = enabled
      ? "Recommendations Blocked"
      : "Recommendations Allowed";
    statusText.style.color = enabled ? "#FF0000" : "#666";
  }
});
