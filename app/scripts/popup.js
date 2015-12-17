'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var bgPage = chrome.extension.getBackgroundPage();
var bookmarkTitleEl = document.getElementById('bookmark-title');
var minsInput = document.getElementById('mins');
var bookmark = undefined;

function minsToMillis(mins) {
  return mins * 60 * 1000;
}

function sanitizeInput() {
  // if the input has no value we will default it to minimum value
  if (isNaN(parseInt(minsInput.value))) {
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

function getBookmark() {
  // at random

  var random = Math.floor(Math.random() * bgPage.bookmarks.length);
  bookmark = bgPage.bookmarks[random];

  bookmarkTitleEl.textContent = bookmark.title;
}

function openBookmark() {
  var mins = Math.round(minsInput.value);
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
[].concat(_toConsumableArray(document.querySelectorAll('.timer-toggle'))).forEach(function (el) {
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
document.getElementById('options').addEventListener('click', function () {
  chrome.runtime.openOptionsPage();
});

// chrome.runtime.openOptionsPage(function callback)