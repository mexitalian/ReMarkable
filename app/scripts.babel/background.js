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
let bookmarkData;
let tabRemovedByExtension;


function msToTime(ms) {
  // to seconds
  let secs = Math.floor( ms / 1000 );
  let mins = Math.floor( secs / 60 );
  let remainingSecs = (secs % 60) + '';
  remainingSecs = remainingSecs.length === 2 ? remainingSecs : '0' + remainingSecs;

  return mins + ':' + remainingSecs;
}

function openBookmark() {

  let timePeriod = bookmarkData.millis;
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

  chrome.tabs.create({url: bookmarkData.redirect}, tab => {
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

chrome.runtime.onMessage.addListener(request => { /*, sender*/

  bookmarkData = request;

  if (typeof currentTab === typeof {})
  {
    tabRemovedByExtension = true;
    chrome.tabs.remove(currentTab.id); // destroy previous roulette tab, callback will openBookmark when ready
  }
  else
  {
    openBookmark();
  }
});

