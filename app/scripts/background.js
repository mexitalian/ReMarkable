'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({ text: 'Mark' });

chrome.runtime.onMessage.addListener(function (request /*, sender*/) {
  console.log(request);
  chrome.tabs.create({ url: request.redirect });
});

console.log('\'Allo \'Allo! Event Page for Browser Action');
//# sourceMappingURL=background.js.map
