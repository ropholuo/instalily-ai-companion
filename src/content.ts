function sendPageContent() {
  const pageContent = document.body.innerText;
  const pageURL = window.location.href;
  chrome.runtime.sendMessage({
    action: "pageContent",
    url: pageURL,
    content: pageContent,
  });
}

// Execute the function to send page content
sendPageContent();

export {};
