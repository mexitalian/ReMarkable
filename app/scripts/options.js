'use strict';

var $ = function $(q) {
  var result = document.querySelectorAll(q);
  return result.length === 1 ? result[0] : result;
};
var $new = function $new(tag) {
  return document.createElement(tag);
};

function toggleFolder(input) {

  chrome.runtime.sendMessage({
    action: 'toggleFolder',
    id: input.value,
    isSelected: input.checked
  });
}

var bgJS = chrome.extension.getBackgroundPage();
var listEl = $('#folder-list');
var frag = document.createDocumentFragment();

// create the checklist
bgJS.folders.forEach(function (folder) {

  var check = $new('input');
  var span = $new('span');
  var label = $new('label');

  check.setAttribute('type', 'checkbox');
  check.value = folder.id;
  check.checked = Boolean(bgJS.folderIDs.find(function (id) {
    return id === folder.id;
  }));

  span.textContent = folder.title;
  label.appendChild(check);
  label.appendChild(span);

  frag.appendChild(label);
});

listEl.addEventListener('click', function (event) {

  var possibleTargets = listEl.querySelectorAll('input');

  for (var index in possibleTargets) {
    var possibleTarget = possibleTargets[index];
    var el = event.target;

    while (el && el !== listEl) {
      if (el === possibleTarget) {
        console.log(el);
        toggleFolder(el);
      }
      el = el.parentNode;
    }
  }
});

listEl.appendChild(frag);
//# sourceMappingURL=options.js.map
