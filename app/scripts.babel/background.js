'use strict';

/*
let startTime = new Date.now();
let currentMillis = today.getMilliseconds()
*/

const TIME_DECR = 1000;
const AMBER_PERIOD = 120000; // 2 min
const RED_PERIOD = 60000; // 1 min
const COLORS = {
  GREEN: '#00CC00', AMBER: '#FFC200', RED: '#FF0000'
};


let currentTab = {};
let countdownID;
let tabRemovedByExtension;
let millis = 10000;
let hasTimer = true;

let originalNodeTree;
let bookmarks = [];
let folders = [];
let folderIDs = new Set();
let currentBookmark;


chrome.storage.sync.set({ millis });



function msToTime(ms) {
  // to seconds
  let secs = Math.floor( ms / 1000 );
  let mins = Math.floor( secs / 60 );
  let remainingSecs = (secs % 60) + '';
  remainingSecs = remainingSecs.length === 2 ? remainingSecs : '0' + remainingSecs;

  return mins + ':' + remainingSecs;
}

/*
    Bookmark sorting
*/

// function

function getFolders(nodes = originalNodeTree, folderArr = folders) {

  nodes.forEach( (node, index) => {

    if (node.children) {

      let clone = Object.assign( {}, node );
      clone.children = node.children.filter( child => child.children );

      folderArr[index] = clone;
      getFolders(clone.children, clone.children); // ugly, not dry, find a better signature
    }
  });
}

function getBookmarks(nodeTree) {

  nodeTree.forEach(bookmark => {

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

  chrome.bookmarks.getChildren(id, children => {
    bookmarks.push( ...children.filter(child => child.url) );
  });
}

function refreshBookmarks() {

  bookmarks = []; // reset the list

  if ( !folderIDs.size ) {
    getBookmarks(originalNodeTree);
  }
  else {
    folderIDs.forEach( id => {
      getBookmarksByFolderID(id);
    });
  }
}

function getBookmarkTreeAndParse() {
  chrome.bookmarks.getTree( nodeTree => {
    originalNodeTree = nodeTree[0].children;
    getBookmarksAndFolders(originalNodeTree);
  });
}

function getRandomBookmark() {

  let random = Math.floor( Math.random() * bookmarks.length );
  return bookmarks[random];
}


// function minsToMillis(mins) {
//   return mins * 60 * 1000;
// }

function setupTimer() {

  let timePeriod = millis;
  let initialColor = timePeriod > AMBER_PERIOD ? 'GREEN'
    : timePeriod > RED_PERIOD ? 'AMBER' : 'RED';

  chrome.browserAction.setBadgeBackgroundColor({color: COLORS[initialColor] });

  if ( timePeriod > AMBER_PERIOD ) {
    setTimeout(function() {
      chrome.browserAction.setBadgeBackgroundColor({color: COLORS.AMBER});
    }, timePeriod - AMBER_PERIOD);
  }
  if ( timePeriod > RED_PERIOD ) {
    setTimeout(function() {
      chrome.browserAction.setBadgeBackgroundColor({color: COLORS.RED});
    }, timePeriod - RED_PERIOD);
  }

  // Initialise timer
  countdownID = setInterval(function() {

    timePeriod -= TIME_DECR;
    chrome.browserAction.setBadgeText({ text: msToTime(timePeriod) });

    if (timePeriod === 0)
    {
      chrome.tabs.remove(currentTab.id);
      clearInterval(countdownID);
    }

  }, TIME_DECR );
}

function openBookmark() {

  chrome.tabs.create({ url: currentBookmark.url }, tab => {
    console.log(tab);
    currentTab = tab;
  });

  // Inject UI and functionality
  chrome.tabs.executeScript(null, { file: 'scripts/overlay.js' });
}

chrome.runtime.onInstalled.addListener(details => {

  console.log('previousVersion', details.previousVersion);
  getBookmarkTreeAndParse();
});

chrome.tabs.onRemoved.addListener(tabID => {

  if (tabID === currentTab.id) {

    clearInterval(countdownID);
    chrome.browserAction.setBadgeText({ text: '' });
    currentTab = {};

    if (tabRemovedByExtension) {
      openBookmark();
      tabRemovedByExtension = false;
    }
  }
});

chrome.runtime.onStartup.addListener(function() { // I cannot see when this event is fired
  console.log('runtime.onStartup');
});

chrome.runtime.onMessage.addListener(( request, sender, sendResponse ) => { /*, sender*/

  // clean up this switch
  // move the blocks into their own functions outside

  switch (request.action) {

    case 'open':

      millis = request.millis;
      currentBookmark = request.bookmark;

      if (currentTab.id)
      {
        tabRemovedByExtension = true;
        chrome.tabs.remove(currentTab.id); // destroy previous roulette tab, callback will openBookmark when ready
      }
      else
      {
        openBookmark();
      }
      break;


    case 'loadBookmarks':
      getBookmarkTreeAndParse();
      break;


    case 'toggleFolder':

      for (let id in request.folders) {

        let isSelected = request.folders[id];

        if ( isSelected ) {
          folderIDs.add(id);
        }
        else {
          folderIDs.delete(id);
        }
      }

      refreshBookmarks();
      sendResponse({ success: true });

      break;


    case 'pageReady':
      if (hasTimer) { setupTimer(); }
      break;
  }

});

chrome.bookmarks.onCreated.addListener(getBookmarkTreeAndParse);
chrome.bookmarks.onRemoved.addListener( id => {
  folderIDs.delete(id);
  getBookmarkTreeAndParse();
});




chrome.browserAction.onClicked.addListener(function(tab) {

  console.log(tab);

  chrome.runtime.sendMessage({
    action: 'open',
    bookmark: getRandomBookmark(),
    millis: millis//, minsToMillis(mins),
    // mins: mins
  });

});


