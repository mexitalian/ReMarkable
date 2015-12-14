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
var frag = document.createDocumentFragment();

// Dom Generation

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
    check.checked = Boolean(list.find(function (id) {
      return id === folder.id;
    }));

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
  for (var i in inputs) {
    inputs[i].checked = isChecked;
  }
}

// Events

function toggleFolder(inputs) {

  var folderIDList = {};

  inputs.forEach(function (input) {
    folderIDList[input.value] = input.checked;
  });

  chrome.runtime.sendMessage({
    action: 'toggleFolder',
    folders: folderIDList
  });
}

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

/*
    Initialise
    ==========
*/

genFolderList();
listEl.appendChild(frag);