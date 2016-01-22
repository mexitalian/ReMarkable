'use strict';

function createTimerUI(millis) {

  let width = '10px';
  let color = '#1478A5';
  let bgColor = '#fff';
  let frag = document.createDocumentFragment();
  let outer = document.createElement('div');
  let inner = document.createElement('div');

  outer.id = 'remark-ext-timer-outer';
  outer.style.position = 'fixed';
  outer.style.zIndex = '300000000';
  outer.style.right = '0';
  outer.style.top = '0';
  outer.style.width = width;
  outer.style.height = '100%';
  outer.style.backgroundColor = bgColor;

  inner.id = 'remark-ext-timer-inner';
  inner.style.position = 'absolute';
  inner.style.bottom = '0';
  inner.style.width = '100%';
  inner.style.height = '100%';
  inner.style.backgroundColor = color;
  inner.style.transition = millis + 'ms';
  inner.style.animationTimingFunction = 'linear';

  // bindTimerUpdate(inner);

  outer.appendChild(inner);
  frag.appendChild(outer);

  document.body.style.borderRight = width + ' solid transparent'; // create space on right side of body content
  document.body.appendChild(frag);

  setInterval(function(){
    inner.style.height = '0%';
  }, 50);

}

function initTimer(millis) {

  createTimerUI(millis);

// Not used yet, could be cool
/*
  setTimeout(function() {

    let close = confirm('Do you want to continue ?');

    if (close) {
      console.log('close');
    }
    else{
      console.log('keep reading');
    }
  }, millis);
*/
}

chrome.storage.sync.get('millis', obj => {
  chrome.runtime.sendMessage({ action: 'pageReady' });
  initTimer(obj.millis);
});