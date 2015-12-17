'use strict';

let bgPage = chrome.extension.getBackgroundPage();
let bookmarkTitleEl = document.getElementById('bookmark-title');
let minsInput = document.getElementById('mins');
let bookmark;

function minsToMillis(mins) {
  return mins * 60 * 1000;
}

function sanitizeInput() {
  // if the input has no value we will default it to minimum value
  if (isNaN( parseInt(minsInput.value) )) {
    minsInput.value = minsInput.min;
  }
}

function spinUp() {
  if (+minsInput.value < +minsInput.max) {
    minsInput.value++;
  }
}
function spinDown() {
  if (+minsInput.value > +minsInput.min) {
    minsInput.value--;
  }
}

function getBookmark() { // at random

  let random = Math.floor( Math.random() * bgPage.bookmarks.length );
  bookmark = bgPage.bookmarks[random];

  bookmarkTitleEl.textContent = bookmark.title;
}

function openBookmark() {
  let mins = Math.round( minsInput.value );
  bgPage.mins = minsInput.value;

  chrome.runtime.sendMessage({
    action: 'open',
    bookmark: bookmark,
    millis: minsToMillis(mins),
    mins: mins
  });
}

/*
    UI State
    --------
*/
getBookmark();
minsInput.value = chrome.extension.getBackgroundPage().mins || minsInput.value;
[...document.querySelectorAll('.timer-toggle')].forEach( el => {
  el.style.display = bgPage.hasTimer ? 'block' : 'none'; // toggle timer visibility
});

/*
    Event Bindings
    --------------
*/
minsInput.addEventListener('blur', sanitizeInput);
document.getElementById('plus').addEventListener('click', spinUp);
document.getElementById('minus').addEventListener('click', spinDown);
document.getElementById('open').addEventListener('click', openBookmark);
document.getElementById('get-bookmark').addEventListener('click', getBookmark);
document.getElementById('options').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});


// chrome.runtime.openOptionsPage(function callback)


/*
    Google Analytics
    ----------------
*/

let _gaq = _gaq || [];

_gaq.push(['_setAccount', 'UA-71522159-1']);
_gaq.push(['_trackPageview']);

(function() {
  let ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  let s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function trackAction(e) {
  _gaq.push(['_trackEvent', e.target.id, 'clicked']);
};

let actions = document.querySelectorAll('.action');
for (var i = 0; i < actions.length; i++) {
  actions[i].addEventListener('click', trackAction);
}