'use strict';


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
const TIME_PERIOD = 180000; // 3 * 60 * 1000;
const TIME_DECR = 1000;
const AMBER_PERIOD = 120000; // 2 min
const RED_PERIOD = 60000; // 1 min
const COLORS = {
  GREEN: '#00CC00', AMBER: '#FFC200', RED: '#FF0000'
};

let timePeriod = TIME_PERIOD;


function millToTime(millis) {
  // to seconds
  let secs = Math.floor( millis / 1000 );
  let mins = Math.floor( secs / 60 );
  let remainingSecs = (secs % 60) + '';
  remainingSecs = remainingSecs.length === 2 ? remainingSecs : '0' + remainingSecs;

  return mins + ':' + remainingSecs;
}


chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

/*
    Run everytime a bookmark is launched
    ------------------------------------
*/
chrome.runtime.onMessage.addListener(function(request/*, sender*/) {

  console.log(request);

  let currentTab;
  let countdownID;
  let initialColor;

  initialColor = timePeriod > AMBER_PERIOD ? 'GREEN' : timePeriod > RED_PERIOD ? 'AMBER' : 'RED';

  chrome.browserAction.setBadgeBackgroundColor({color: COLORS[initialColor] });

  if ( timePeriod > AMBER_PERIOD ) {
    setTimeout(function() { chrome.browserAction.setBadgeBackgroundColor({color: COLORS.AMBER}); }, timePeriod - AMBER_PERIOD);
  }
  if ( timePeriod > RED_PERIOD ) {
      setTimeout(function() { chrome.browserAction.setBadgeBackgroundColor({color: COLORS.RED}); }, timePeriod - RED_PERIOD);
  }

  chrome.tabs.create({url: request.redirect}, tab => {
    console.log(tab);
    currentTab = tab;
  });

  chrome.tabs.onRemoved.addListener(function(tabID) {
    if (tabID === currentTab.id)
    {
      timePeriod = TIME_PERIOD;
      clearInterval(countdownID);
      chrome.browserAction.setBadgeText({ text: ''});
    }
  });

  // Initialise timer
  countdownID = setInterval(function() {

    timePeriod -= TIME_DECR;
    chrome.browserAction.setBadgeText({ text: millToTime(timePeriod) });

    if (timePeriod === 0)
    {
      chrome.tabs.remove(currentTab.id);
    }

  }, TIME_DECR );

});


// console.log('\'Allo \'Allo! Event Page for Browser Action');