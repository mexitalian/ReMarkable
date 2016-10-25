'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var $ = function $(q) {
  var result = document.querySelectorAll(q);
  return result.length === 1 ? result[0] : result;
};
var $new = function $new(tag) {
  return document.createElement(tag);
};
var bgJS = chrome.extension.getBackgroundPage();
var listEl = $('#folder-list');
var folderCountEl = $('#status-folder-count');
var bookmarkCountEl = $('#status-bookmark-count');
var timerRadioElList = [].concat(_toConsumableArray($('input[name="timer"]')));
var frag = document.createDocumentFragment();

// Dom Generation / Manipulation

function updateFolderCounts(response) {
  console.log(response);
  folderCountEl.textContent = bgJS.folderIDs.size || 'all';
  bookmarkCountEl.textContent = bgJS.bookmarks.length;
}

function genFolderList() {
  var list = arguments.length <= 0 || arguments[0] === undefined ? bgJS.folders : arguments[0];
  var containerEl = arguments.length <= 1 || arguments[1] === undefined ? frag : arguments[1];


  list.forEach(function (folder) {

    var li = $new('li');
    var label = $new('label');
    var check = $new('input');
    var span = $new('span');

    check.id = 'folder-' + folder.id;
    check.value = folder.id;
    check.setAttribute('type', 'checkbox');
    check.checked = bgJS.folderIDs.has(folder.id);

    span.textContent = folder.title;
    label.appendChild(check);
    label.appendChild(span);
    li.appendChild(label);

    //  recurse and create sub folders
    if (folder.children) {

      var ul = $new('ul');

      genFolderList(folder.children, ul);
      li.appendChild(ul);
    }

    containerEl.appendChild(li);
  });
}

function getDescendantInputs(parentEl) {

  var li = parentEl.parentNode.parentNode;
  var inputs = [].concat(_toConsumableArray(li.querySelectorAll('input')));

  return inputs;
}

function toggleCheckboxUI(inputs, isChecked) {
  for (var j in inputs) {
    inputs[j].checked = isChecked;
  }
}

function resetCheckboxUI() {
  toggleCheckboxUI([].concat(_toConsumableArray(listEl.querySelectorAll('input'))), false);
}

function selectCurrentTimerRadio() {
  timerRadioElList.forEach(function (radio) {

    if (Boolean(+radio.value) === bgJS.hasTimer) {
      radio.checked = true;
    }
  });
}

// Events

function toggleFolder(inputs) {

  var folderIDList = {};

  inputs.forEach(function (input) {
    folderIDList[input.value] = input.checked;
  });

  chrome.runtime.sendMessage({
    action: 'toggleFolder',
    folders: folderIDList,
    responseCallback: updateFolderCounts
  }, updateFolderCounts);
}

function resetFolders() {
  bgJS.folderIDs.clear();
  bgJS.refreshBookmarks();
  resetCheckboxUI();
  updateFolderCounts();
}

// TODO: turn this into a universal event bubbling listener and use for the timer radios
listEl.addEventListener('click', function (event) {

  var possibleTargets = listEl.querySelectorAll('input');

  for (var index in possibleTargets) {
    var possibleTarget = possibleTargets[index];
    var el = event.target;

    while (el && el !== listEl) {
      if (el === possibleTarget) {
        var isParentChecked = el.checked;
        var inputs = getDescendantInputs(el);

        toggleCheckboxUI(inputs, isParentChecked);
        toggleFolder(inputs);
      }

      el = el.parentNode;
    }
  }
});

document.querySelector('#action-folders-clear').addEventListener('click', resetFolders);
timerRadioElList.forEach(function (radio) {
  radio.addEventListener('click', function (event) {
    bgJS.hasTimer = Boolean(+event.target.value);
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

var _gaq = _gaq || [];

_gaq.push(['_setAccount', 'UA-71522159-1']);
_gaq.push(['_trackPageview']);

(function () {
  var ga = document.createElement('script');ga.type = 'text/javascript';ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];s.parentNode.insertBefore(ga, s);
})();

function trackAction(e) {
  _gaq.push(['_trackEvent', e.target.id, 'clicked']);
};

var actions = document.querySelectorAll('.action');
for (var i = 0; i < actions.length; i++) {
  actions[i].addEventListener('click', trackAction);
}