'use strict';

let bgPage = chrome.extension.getBackgroundPage();
let bookmarkTitleEl = document.getElementById('bookmark-title');
let minsInput = document.getElementById('mins');

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

function getBookmark() {
  let bookmark = bgPage.getRandomBookmark();
  bookmarkTitleEl.textContent = bookmark.title;
}

function openBookmark() {
  let mins = Math.round( minsInput.value );
  bgPage.mins = minsInput.value;

  chrome.runtime.sendMessage({
    action: 'open',
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
document.getElementById('options').addEventListener('click', event => {
  chrome.runtime.openOptionsPage();
});


// chrome.runtime.openOptionsPage(function callback)

