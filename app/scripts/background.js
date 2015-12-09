'use strict'

/*
let startTime = new Date.now();
let currentMillis = today.getMilliseconds()
*/

;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var TIME_DECR = 1000;
var AMBER_PERIOD = 120000; // 2 min
var RED_PERIOD = 60000; // 1 min
var COLORS = {
  GREEN: '#00CC00', AMBER: '#FFC200', RED: '#FF0000'
};

var currentTab = undefined;
var countdownID = undefined;
var tabRemovedByExtension = undefined;

var bookmarks = [];
var folders = [];
var millis = undefined;

function msToTime(ms) {
  // to seconds
  var secs = Math.floor(ms / 1000);
  var mins = Math.floor(secs / 60);
  var remainingSecs = secs % 60 + '';
  remainingSecs = remainingSecs.length === 2 ? remainingSecs : '0' + remainingSecs;

  return mins + ':' + remainingSecs;
}

function filterBookmarks(nodeTree) {

  nodeTree.forEach(function (bookmark) {

    if (bookmark.url) {
      bookmarks.push(bookmark);
      console.log(bookmark);
    } else {
      folders.push(bookmark);
    }

    if (bookmark.children) {
      filterBookmarks(bookmark.children);
    }
  });
}

function getRandomMark() {

  var randomIndex = Math.floor(Math.random() * bookmarks.length);

  //I don't think we need a while here
  while (true) {
    console.log(randomIndex);
    if (bookmarks[randomIndex].url) {
      return bookmarks[randomIndex];
    } else {
      randomIndex = Math.floor(Math.random() * bookmarks.length);
    }
  }
}

function openBookmark() {

  var timePeriod = millis;
  var initialColor = timePeriod > AMBER_PERIOD ? 'GREEN' : timePeriod > RED_PERIOD ? 'AMBER' : 'RED';

  chrome.browserAction.setBadgeBackgroundColor({ color: COLORS[initialColor] });

  if (timePeriod > AMBER_PERIOD) {
    setTimeout(function () {
      chrome.browserAction.setBadgeBackgroundColor({ color: COLORS.AMBER });
    }, timePeriod - AMBER_PERIOD);
  }
  if (timePeriod > RED_PERIOD) {
    setTimeout(function () {
      chrome.browserAction.setBadgeBackgroundColor({ color: COLORS.RED });
    }, timePeriod - RED_PERIOD);
  }

  chrome.tabs.create({ url: getRandomMark().url }, function (tab) {
    console.log(tab);
    currentTab = tab;
  });

  // Initialise timer
  countdownID = setInterval(function () {

    timePeriod -= TIME_DECR;
    chrome.browserAction.setBadgeText({ text: msToTime(timePeriod) });

    if (timePeriod === 0) {
      chrome.tabs.remove(currentTab.id);
      clearInterval(countdownID);
    }
  }, TIME_DECR);
}

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onRemoved.addListener(function (tabID) {

  if (tabID === currentTab.id) {

    clearInterval(countdownID);
    chrome.browserAction.setBadgeText({ text: '' });
    currentTab = undefined;

    if (tabRemovedByExtension) {
      openBookmark();
      tabRemovedByExtension = false;
    }
  }
});

// chrome.runtime.onStartup.addListener(function() {

// });

chrome.runtime.onMessage.addListener(function (request) {
  /*, sender*/

  switch (request.action) {

    case 'open':

      millis = request.millis;

      if ((typeof currentTab === 'undefined' ? 'undefined' : _typeof(currentTab)) === _typeof({})) {
        tabRemovedByExtension = true;
        chrome.tabs.remove(currentTab.id); // destroy previous roulette tab, callback will openBookmark when ready
      } else {
          openBookmark();
        }
      break;

    case 'loadBookmarks':
      chrome.bookmarks.getTree(filterBookmarks);
      break;
  }
});
//# sourceMappingURL=background.js.map
