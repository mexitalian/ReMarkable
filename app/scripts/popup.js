'use strict';

var realBookmarks = [];
var minsInput = document.getElementById('mins');

function filterBookmarks(bookmarks) {

  bookmarks.forEach(function (bookmark) {

    if (bookmark.url) {
      realBookmarks.push(bookmark);
      // console.log('bookmark: ' + bookmark.title + ' ~  ' + bookmark.url);
    }

    if (bookmark.children) {
      filterBookmarks(bookmark.children);
    }
  });
}

function getRandomMark() {
  var randomIndex = Math.floor(Math.random() * realBookmarks.length);

  while (true) {
    console.log(randomIndex);
    if (realBookmarks[randomIndex].url) {
      return realBookmarks[randomIndex];
    } else {
      randomIndex = Math.floor(Math.random() * realBookmarks.length);
    }
  }
}

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
function onGetBookmark() {
  // chrome.bookmarks.getTree(getRandomMark);
  var mark = getRandomMark();
  var mins = Math.round(minsInput.value);

  console.log(mark.url);

  localStorage.timePeriod = minsInput.value;

  chrome.runtime.sendMessage({
    redirect: mark.url,
    millis: minsToMillis(mins)
  });
}

/*
    UI State
    --------
*/
if (localStorage.timePeriod) {
  document.getElementById('mins').value = localStorage.timePeriod;
}

/*
    Event Bindings
    --------------
*/
document.getElementById('mins').addEventListener('blur', sanitizeInput);
document.getElementById('plus').addEventListener('click', spinUp);
document.getElementById('minus').addEventListener('click', spinDown);
document.getElementById('get-bookmarks').addEventListener('click', onGetBookmark);

chrome.bookmarks.getTree(filterBookmarks);
//# sourceMappingURL=popup.js.map
