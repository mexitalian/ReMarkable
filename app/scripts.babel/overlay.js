'use strict';

const cssPrefix = 'remark-ext-';

function createDiv(opts) {

  let tagName = opts.tagName || 'div';

  let el = (tagName === 'image') ?
    new Image() :
    (tagName === 'frag') ?
      document.createDocumentFragment() : document.createElement(tagName);

  if (opts.id) {
    el.id = `${cssPrefix}${opts.id}`;
  }
  if (opts.parent) {
    opts.parent.appendChild(el);
  }
  if (opts.class) {
    el.className = `${cssPrefix}${opts.class}`;
  }
  if (opts.src && tagName === 'image') {
    el.src = opts.src;
  }
  if (opts.bgSrc) {
    el.style.backgroundImage = `url(${opts.bgSrc})`;
  }
  if (opts.text) {
    el.textContent = opts.text;
  }
  if (opts.onClick) {
    el.addEventListener('click', opts.onClick);
  }
  if (opts.html) {
    el.innerHTML = opts.html;
  }

  return el;
}

function createDivs(divs/*, opts*/) {

  let frag = document.createDocumentFragment();

  divs.forEach( divOptions => {
    frag.appendChild( createDiv(divOptions) );
  });
/*
  if (opts.parent) {
    opts.parent.appendChild(frag);
  }
*/
  return frag;
}

function createIcons() {

  let frag = document.createDocumentFragment();
  let icons = createDivs([
    {
      tagName: 'image',
      id: 'logo',
      src: chrome.extension.getURL('images/icon-128.png')
    },
    {
      id: 'folder',
      class: 'icon',
      bgSrc: chrome.extension.getURL('images/open_folder.svg'),
      onClick: function() { chrome.runtime.sendMessage({action: 'gotoBookmarks'}); }
    },
    {
      tagName: 'span',
      id: 'info-text',
      class: 'label'
    },
    {
      id: 'restart',
      class: 'icon',
      bgSrc: chrome.extension.getURL('images/restart.svg'),
      onClick: function() { chrome.runtime.sendMessage({action: 'open'}); }
    },
    {
      tagName: 'span',
      class: 'label',
      text: 'Get another'
    },
    {
      id: 'clock',
      class: 'icon',
      bgSrc: chrome.extension.getURL('images/clock.svg'),
      onClick: function() {

        let millis = Math.abs(+document.getElementById( `${cssPrefix}mins-input` ).value * 60000);
        let innerTimer = document.getElementById( `${cssPrefix}timer-inner` );

        // Extension countdown
        chrome.runtime.sendMessage({
          action: 'setTimer',
          millis: millis
        });

        // DOM countdown
        innerTimer.style.transition = '0ms';
        innerTimer.style.transform = 'translateY(0%)';
        setTimeout(() => {
          innerTimer.style.transition = `${millis}ms`;
          innerTimer.style.transform= 'translateY(100%)';
        }, 50);
      }
    },
    {
      tagName: 'label',
      class: 'label',
      html: `Countdown<br><input type="number" value="5" min="1" max="60" step="1" name="${cssPrefix}mins-input" id="${cssPrefix}mins-input"/>mins`
    },
    {
      id: 'configure',
      class: 'icon',
      bgSrc: chrome.extension.getURL('images/settings.svg'),
      onClick: function() { chrome.runtime.sendMessage({action: 'openSettings'}); }
    },
    {
      tagName: 'span',
      class: 'label',
      text: 'Edit settings'
    }
  ]);

  frag.appendChild(icons);

  return frag;
}

function createTimerUI(millis) {

  let outer = createDiv({id: 'timer-outer'});
  let inner = createDiv({id: 'timer-inner'});

  outer.appendChild(inner);

  inner.style.height = '100%';
  inner.style.transition = millis + 'ms';

  return [outer, inner];
}

function createUI(millis) {

  let container = createDiv({id: 'ui-containter'});
  let [ timer, timerInner ] = createTimerUI(millis);
  let icons = createIcons();

  container.appendChild(timer);
  container.appendChild(icons);

  // create space on right side of body content
  document.body.style.borderRight = '10px solid transparent';
  document.body.appendChild(container);
/*
  setTimeout(function() {
    timerInner.style.height = '0%';
  }, 50);
*/
  setTimeout(function() {
    container.className = 'ready';
  }, 1500);
}



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


chrome.storage.sync.get('millis', obj => {
  chrome.runtime.sendMessage({ action: 'pageReady' });

  createUI(obj.millis);
/*
  chrome.storage.local.get('currentBookmark', bObj => {
    let b = bObj.currentBookmark;
    // document.getElementById( `${cssPrefix}info-text` ).textContent = `${b.title} \n ${( new Date(b.dateAdded) ).toDateString()}`;
    document.getElementById( `${cssPrefix}info-text` ).textContent = `Added:<br> ${( new Date(b.dateAdded) ).toDateString()}`;
  });
*/
  chrome.storage.local.get('currentParent', pArr => {

    document.getElementById( `${cssPrefix}info-text` ).textContent = pArr.currentParent.chrome.title;
    /*document.getElementById(id).addEventListener('click', ev => {
      ev.preventDefault();
      chrome.runtime.sendMessage({
        action: 'gotoBookmarks',
        url: p.bookmarkUrl
      });
    });*/
  });

});
