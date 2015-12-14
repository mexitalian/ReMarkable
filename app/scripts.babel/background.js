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

let currentTab;
let countdownID;
let tabRemovedByExtension;
let millis;

let originalNodeTree;
let bookmarks = [];
let folders = [];
let folderIDs = new Set();


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

function getFolders(nodes, folderArr = folders) {

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

// function orderFolders() {
// }

function getRandomBookmark() {

  let random = Math.floor( Math.random() * bookmarks.length );

  return bookmarks[random];
}

function openBookmark() {

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

  chrome.tabs.create({ url: getRandomBookmark().url }, tab => {
    console.log(tab);
    currentTab = tab;
  });

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



chrome.runtime.onInstalled.addListener(details => {

  console.log('previousVersion', details.previousVersion);

  chrome.bookmarks.getTree( nodeTree => {
    originalNodeTree = nodeTree[0].children;
    getBookmarksAndFolders(originalNodeTree);
  });
});

chrome.tabs.onRemoved.addListener(tabID => {

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

chrome.runtime.onStartup.addListener(function() { // I cannot see when this event is fired
  console.log('runtime.onStartup');
});

chrome.runtime.onMessage.addListener(request => { /*, sender*/

  // clean up this switch
  // move the blocks into their own functions outside

  switch (request.action) {

    case 'open':

      millis = request.millis;

      if (typeof currentTab === typeof {})
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
      chrome.bookmarks.getTree( nodeTree => {
        originalNodeTree = nodeTree[0].children.children;
        getBookmarksAndFolders(originalNodeTree);
      });
      break;


    case 'toggleFolder':

      let {folders} = request;

      for (let id in folders) {

        let isSelected = folders[id];

        if ( isSelected ) {
          folderIDs.add(id);
        }
        else {
          folderIDs.delete(id);
        }
      }

      refreshBookmarks();

      break;
  }

});

