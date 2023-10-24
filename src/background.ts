// background.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "pageContent") {
    console.log("Received page: ", request.url);
    // console.log("Received page content: ", request.content);
    chrome.runtime.sendMessage({
      name: "web-content",
      data: request.content,
      url: request.url,
    });
  }
});

export {};
