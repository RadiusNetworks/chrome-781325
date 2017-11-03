let config = {
  "contents": [
    {
      "id": 1,
      "name": "Clouds",
      "url": "/videos/clouds.webm",
      "duration": 8
    },
    {
      "id": 2,
      "name": "Small",
      "url": "/videos/small.webm",
      "duration": 5
    },
    {
      "id": 3,
      "name": "Turbines",
      "url": "/videos/turbines.webm",
      "duration": 9
    }
  ]
}

var currentContent;

window.onload = function() {
  start();
}

function start() {
  console.info("Starting application");
  currentContentIndex = -1;
  rotate();
}

// Posts a message to an iframe when it loads to enable window messaging
function postInitMessageToWebview(event) {
  console.log("posting init message");
  var msg = {"type": "dkevent-webviewinit"};
  event.target.contentWindow.postMessage(msg, "*");
  chrome.runtime.sendMessage({"greeting": "hello"}, function(response) {
    console.log("got response", response);
  })
}

function rotate(contents) {
  let content = findNextContent();
  let oldWebview = document.querySelector("main webview");
  let newWebview = createWebviewElement(content);
  console.log(`Rotating to content: ${content.name} (item ${content.id}/${config.contents.length})` );
  transitionWebviews(oldWebview, newWebview);
  scheduleNextRotation(content.duration);
}

function scheduleNextRotation(duration) {
  setTimeout(function() {
    rotate();
  }, duration * 1000);
}

function transitionWebviews(oldWebview, newWebview) {
  document.querySelector("main").appendChild(newWebview);
  if (oldWebview) {
    document.querySelector("main").removeChild(oldWebview);
  }
}

function findNextContent() {
  if (currentContentIndex >= config.contents.length - 1) {
    currentContentIndex = 0;
  }
  else {
    currentContentIndex += 1;
  }
  return config.contents[currentContentIndex];
}

function createWebviewElement(content) {
  let webviewElement = document.createElement("webview");
  webviewElement.id = "content-" + (new Date()).getTime();
  webviewElement.src = `/video.html?video=${content.url}&duration=${content.duration}&id=${chrome.runtime.id}`;
  webviewElement.partition = "persist:displaykit";
  return webviewElement;
}

function swapWebview() {
  let webview = createWebview(pages[currentIndex]);
  document.querySelector("main").appendChild(webview);

  if (document.querySelector("main").children.length > 1) {
    let firstChild = document.querySelector("main").firstChild;
    document.querySelector("main").removeChild(firstChild)
  }

  currentIndex += 1;
  if (currentIndex > pages.length) {
    currentIndex = 0;
  }
}

window.onkeydown = function(e) { 
  // Alt-Q
  if (e.altKey && e.keyCode === 81) {
    console.log("Restarting");
    chrome.runtime.restart();
  } 
};
