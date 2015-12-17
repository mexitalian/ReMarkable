'use strict'

/*
let startTime = new Date.now();
let currentMillis = today.getMilliseconds()
*/

;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var TIME_DECR = 1000;
var AMBER_PERIOD = 120000; // 2 min
var RED_PERIOD = 60000; // 1 min
var COLORS = {
  GREEN: '#00CC00', AMBER: '#FFC200', RED: '#FF0000'
};

var currentTab = undefined;
var countdownID = undefined;
var tabRemovedByExtension = undefined;
var millis = undefined;
var hasTimer = true;

var originalNodeTree = undefined;
var bookmarks = [];
var folders = [];
var folderIDs = new Set();
var currentBookmark = undefined;

function msToTime(ms) {
  // to seconds
  var secs = Math.floor(ms / 1000);
  var mins = Math.floor(secs / 60);
  var remainingSecs = secs % 60 + '';
  remainingSecs = remainingSecs.length === 2 ? remainingSecs : '0' + remainingSecs;

  return mins + ':' + remainingSecs;
}

/*
    Bookmark sorting
*/

// function

function getFolders() {
  var nodes = arguments.length <= 0 || arguments[0] === undefined ? originalNodeTree : arguments[0];
  var folderArr = arguments.length <= 1 || arguments[1] === undefined ? folders : arguments[1];

  nodes.forEach(function (node, index) {

    if (node.children) {

      var clone = Object.assign({}, node);
      clone.children = node.children.filter(function (child) {
        return child.children;
      });

      folderArr[index] = clone;
      getFolders(clone.children, clone.children); // ugly, not dry, find a better signature
    }
  });
}

function getBookmarks(nodeTree) {

  nodeTree.forEach(function (bookmark) {

    if (bookmark.url) {
      bookmarks.push(bookmark);
    }

    if (bookmark.children) {
      getBookmarks(bookmark.children);
    }
  });
}

function getBookmarksAndFolders(nodeTree) {
  getBookmarks(nodeTree);
  getFolders(nodeTree);
}

function getBookmarksByFolderID(id) {

  // Only get shallow results
  // All selected folders (including children) have a separate id entry

  chrome.bookmarks.getChildren(id, function (children) {
    var _bookmarks;

    (_bookmarks = bookmarks).push.apply(_bookmarks, _toConsumableArray(children.filter(function (child) {
      return child.url;
    })));
  });
}

function refreshBookmarks() {

  bookmarks = []; // reset the list

  if (!folderIDs.size) {
    getBookmarks(originalNodeTree);
  } else {
    folderIDs.forEach(function (id) {
      getBookmarksByFolderID(id);
    });
  }
}

function getBookmarkTreeAndParse() {
  chrome.bookmarks.getTree(function (nodeTree) {
    originalNodeTree = nodeTree[0].children;
    getBookmarksAndFolders(originalNodeTree);
  });
}

// function orderFolders() {
// }

function getRandomBookmark() {

  var random = Math.floor(Math.random() * bookmarks.length);
  currentBookmark = bookmarks[random];

  return currentBookmark;
}

function setupTimer() {

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

function openBookmark() {

  chrome.tabs.create({ url: currentBookmark.url }, function (tab) {
    console.log(tab);
    currentTab = tab;
  });

  if (hasTimer) {
    setupTimer();
  }
}

chrome.runtime.onInstalled.addListener(function (details) {

  console.log('previousVersion', details.previousVersion);
  getBookmarkTreeAndParse();
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

chrome.runtime.onStartup.addListener(function () {
  // I cannot see when this event is fired
  console.log('runtime.onStartup');
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  /*, sender*/

  // clean up this switch
  // move the blocks into their own functions outside

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
      getBookmarkTreeAndParse();
      break;

    case 'toggleFolder':

      for (var id in request.folders) {

        var isSelected = request.folders[id];

        if (isSelected) {
          folderIDs.add(id);
        } else {
          folderIDs.delete(id);
        }
      }

      refreshBookmarks();
      sendResponse({ success: true });

      break;
  }
});

chrome.bookmarks.onCreated.addListener(getBookmarkTreeAndParse);
chrome.bookmarks.onRemoved.addListener(function (id) {
  folderIDs.delete(id);
  getBookmarkTreeAndParse();
});