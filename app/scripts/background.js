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
var millis = undefined;

var originalNodeTree = undefined;
var bookmarks = [];
var folders = [];
var folderIDs = [];

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

function getFolders(nodes) {
  var folderArr = arguments.length <= 1 || arguments[1] === undefined ? folders : arguments[1];

  nodes.forEach(function (node, index) {

    if (node.children) {

      node.children = node.children.filter(function (node) {
        return node.children;
      });

      folderArr[index] = node;
      getFolders(node.children, node.children); // ugly, not dry, find a better signature
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

  chrome.bookmarks.getChildren(id, getBookmarks);
}

function refreshBookmarks() {

  bookmarks = []; // reset the list

  if (folderIDs.length === 0) {
    getBookmarks(originalNodeTree);
  } else {
    folderIDs.forEach(function (id) {
      getBookmarksByFolderID(id);
    });
  }
}

// function orderFolders() {

// }

function getRandomBookmark() {

  var random = Math.floor(Math.random() * bookmarks.length);

  //I don't think we need a while here
  while (true) {
    console.log(random);
    if (bookmarks[random].url) {
      return bookmarks[random];
    } else {
      random = Math.floor(Math.random() * bookmarks.length);
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

  chrome.tabs.create({ url: getRandomBookmark().url }, function (tab) {
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

  chrome.bookmarks.getTree(function (nodeTree) {
    originalNodeTree = nodeTree[0].children;
    getBookmarksAndFolders(originalNodeTree);
  });
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

chrome.runtime.onMessage.addListener(function (request) {
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
      chrome.bookmarks.getTree(function (nodeTree) {
        originalNodeTree = nodeTree[0].children.children;
        getBookmarksAndFolders(originalNodeTree);
      });
      break;

    case 'toggleFolder':
      var id = request.id;
      var isSelected = request.isSelected;

      if (isSelected) {
        folderIDs.push(id);
      } else {
        var idIndex = folderIDs.findIndex(function (val) {
          return val === id;
        });
        folderIDs.splice(idIndex, 1);
      }

      refreshBookmarks();

      break;
  }
});
//# sourceMappingURL=background.js.map
