'use strict'

/*
    TODOs
    =====
    
    At the moment this works for one tab only

    [ ] Track which tabs were opened and have timers set per–tab

*/

/*
let startTime = new Date.now();
let currentMillis = today.getMilliseconds()
*/
;
var TIME_PERIOD = 180000; // 3 * 60 * 1000;
var timePeriod = TIME_PERIOD;
var TIME_DECR = 1000;
// const AMBER_PERIOD = 120000; // 2 min
// const RED_PERIOD = 60000; // 1 min

// const GREEN = '#00CC00';
// const AMBER = '#FFC200';
// const RED = '#FF0000';

function millToTime(millis) {
  // to seconds
  var secs = Math.floor(millis / 1000);
  var mins = Math.floor(secs / 60);
  var remainingSecs = secs % 60 + '';
  remainingSecs = remainingSecs.length === 2 ? remainingSecs : '0' + remainingSecs;

  return mins + ':' + remainingSecs;
}

// function onTabRemove(tabID) {
//     if (tabID === currentTab.id)
//     {

//     }
// }

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

/*
    Run everytime a bookmark is launched
*/
chrome.runtime.onMessage.addListener(function (request /*, sender*/) {

  console.log(request);

  var currentTab = undefined;
  var countdownID = undefined;

  chrome.tabs.create({ url: request.redirect }, function (tab) {
    console.log(tab);
    currentTab = tab;
  });

  chrome.tabs.onRemoved.addListener(function (tabID) {
    if (tabID === currentTab.id) {
      timePeriod = TIME_PERIOD;
      clearInterval(countdownID);
      chrome.browserAction.setBadgeText({ text: '' });
    }
  });

  // Initialise timer
  countdownID = setInterval(function () {

    timePeriod -= TIME_DECR;
    chrome.browserAction.setBadgeText({ text: millToTime(timePeriod) });

    if (timePeriod === 0) {
      chrome.tabs.remove(currentTab.id);
    }
  }, TIME_DECR);
});

/*
// Setup initial badge state and callbacks
chrome.browserAction.setBadgeText({text: millToTime(timePeriod)});

if(timePeriod > AMBER_PERIOD)
{  
  chrome.browserAction.setBadgeBackgroundColor({color: GREEN});
  setTimeout(function() { chrome.browserAction.setBadgeBackgroundColor({color: AMBER}); }, AMBER_PERIOD);
  setTimeout(function() { chrome.browserAction.setBadgeBackgroundColor({color: RED}); }, RED_PERIOD);
}
else if (timePeriod > RED_PERIOD)
{
  chrome.browserAction.setBadgeBackgroundColor({color: AMBER});
  setTimeout(function() { chrome.browserAction.setBadgeBackgroundColor({color: RED}); }, RED_PERIOD);
}
else
{
  chrome.browserAction.setBadgeBackgroundColor({color: RED});
}
*/

// console.log('\'Allo \'Allo! Event Page for Browser Action');
//# sourceMappingURL=background.js.map
