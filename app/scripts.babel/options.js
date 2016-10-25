'use strict';

let $ = function(q) {
  let result = document.querySelectorAll(q);
  return result.length === 1 ? result[0] : result;
};
let $new = tag => document.createElement(tag);
let bgJS = chrome.extension.getBackgroundPage();
let listEl = $('#folder-list');
let folderCountEl = $('#status-folder-count');
let bookmarkCountEl = $('#status-bookmark-count');
let timerRadioElList = [...$('input[name="timer"]')];
let frag = document.createDocumentFragment();


// Dom Generation / Manipulation

function updateFolderCounts(response) {
  // console.log(response);
  folderCountEl.textContent = bgJS.folderIDs.size || 'all';
  bookmarkCountEl.textContent = bgJS.bookmarks.length;
}

function genFolderList( list = bgJS.folders, containerEl = frag ) {

  list.forEach( folder => {

    let li = $new('li');
    let label = $new('label');
    let check = $new('input');
    let span = $new('span');
    let toggle = $new('div');

    check.id = `folder-${folder.id}`;
    check.value = folder.id;
    check.setAttribute('type', 'checkbox');
    check.checked = bgJS.folderIDs.has(folder.id);

    span.textContent = folder.title;
    toggle.className = 'toggle';
    toggle.textContent = folder.children.length > 0 ? '+' : '';
    label.appendChild(check);
    label.appendChild(span);
    label.appendChild(toggle);
    li.appendChild(label);

//  recurse and create sub folders
    if (folder.children.length > 0) {

      let ul = $new('ul');

      genFolderList( folder.children, ul );
      li.appendChild(ul);
    }

    containerEl.appendChild(li);
  });
}

function getDescendantInputs(parentEl) {

  let li = parentEl.parentNode.parentNode;
  let inputs = [...li.querySelectorAll('input')];

  return inputs;
}

function toggleCheckboxUI( inputs, isChecked ) {
  for ( let j in inputs ) {
    inputs[j].checked = isChecked;
  }
}

function togglePartialCheckboxUI(input) {
  // update parent checkboxes to have a .partial class
  let parent = input.parentNode.parentNode.parentNode.parentNode; // traverse upward to the next li
  input.className = '';

  while (parent.tagName === 'UL' || parent.tagName === 'LI' || parent.tagName === 'LABEL') {

    let siblings = input.parentNode.parentNode.parentNode.querySelectorAll('li > label > input');
    let parentContainsSelected;

    if (input.checked) {
      parentContainsSelected = true;
    }

    siblings.forEach(sibling => {
      if (
        input.id !== sibling.id &&
        (sibling.checked || sibling.className === 'partial')
      ) {
        parentContainsSelected = true;
        return;
      }
    });

    if (
      parent.tagName == 'LI' &&
      parent.querySelector('label > input').checked != true
    ) {
      parent.querySelector('label > input').className = parentContainsSelected ? 'partial' : '';
    }
    parent = parent.parentNode;
  }
}

function resetCheckboxUI() {
  toggleCheckboxUI( [...listEl.querySelectorAll('input')], false );
}

function selectCurrentTimerRadio() {
  timerRadioElList.forEach( radio => {

    if ( Boolean(+radio.value) === bgJS.hasTimer ) {
      radio.checked = true;
    }
  });
}

// Events

function toggleFolder(inputs) {

  let folderIDList = {};

  inputs.forEach(input => {
    folderIDList[input.value] = input.checked;
  });

  chrome.runtime.sendMessage({
    action: 'toggleFolder',
    folders: folderIDList,
    responseCallback: updateFolderCounts
  }, updateFolderCounts );

}

function resetFolders() {
  bgJS.folderIDs.clear();
  bgJS.refreshBookmarks();
  resetCheckboxUI();
  updateFolderCounts();
}

function expandSubLevel(el) {
  let ul = el.parentElement.parentElement.querySelector('ul');
  let style = ul.style.display === '' ? 'block' : ul.style.display === 'block' ? 'none' : 'block';

  ul.style.display = style;
  el.textContent = el.innerHTML === '+' ? '-' : '+';
}

// TODO: turn this into a universal event bubbling listener and use for the timer radios
listEl.addEventListener('click', event => {

  let possibleTargets = listEl.querySelectorAll('input');
  let toggles = listEl.querySelectorAll('.toggle');

  toggles.forEach(toggle => {
    if (event.target === toggle) {
      event.preventDefault();
      event.stopPropagation(); // kill the bubbling
      expandSubLevel(event.target);
    }
  });

  for ( let index in possibleTargets )
  {
    let possibleTarget = possibleTargets[index];
    let el = event.target;

    while (el && el !== listEl)
    {
      if (el === possibleTarget)
      {
        let isParentChecked = el.checked;
        let inputs = getDescendantInputs(el);

        toggleCheckboxUI(inputs, isParentChecked);
        togglePartialCheckboxUI(el);
        toggleFolder(inputs);
      }

      el = el.parentNode;
    }
  }
});

document.querySelector('#action-folders-clear').addEventListener('click', resetFolders);
timerRadioElList.forEach( radio => {
  radio.addEventListener('click', event => {
    bgJS.hasTimer = Boolean( +event.target.value );
  });
});


/*
    Initialise
    ==========
*/

genFolderList();
listEl.appendChild(frag);
updateFolderCounts();
selectCurrentTimerRadio();


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
