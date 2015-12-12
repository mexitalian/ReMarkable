'use strict';

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

function onGetBookmark() {
  let mins = Math.round( minsInput.value );
  chrome.extension.getBackgroundPage().mins = minsInput.value;

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
minsInput.value = chrome.extension.getBackgroundPage().mins || minsInput.value;

/*
    Event Bindings
    --------------
*/
document.getElementById('mins').addEventListener('blur', sanitizeInput);
document.getElementById('plus').addEventListener('click', spinUp);
document.getElementById('minus').addEventListener('click', spinDown);
document.getElementById('get-bookmarks').addEventListener('click', onGetBookmark);
document.getElementById('options').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});


// chrome.runtime.openOptionsPage(function callback)

