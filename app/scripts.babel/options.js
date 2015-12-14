'use strict';

let $ = function(q) {
  let result = document.querySelectorAll(q);
  return result.length === 1 ? result[0] : result;
};
let $new = tag => document.createElement(tag);
let bgJS = chrome.extension.getBackgroundPage();
let listEl = $('#folder-list');
let frag = document.createDocumentFragment();


// Dom Generation

function genFolderList( list = bgJS.folders, containerEl = frag ) {

  list.forEach( folder => {

    let li = $new('li');
    let label = $new('label');
    let check = $new('input');
    let span = $new('span');

    check.id = `folder-${folder.id}`;
    check.value = folder.id;
    check.setAttribute('type', 'checkbox');
    check.checked = Boolean( list.find( id => id === folder.id ) );

    span.textContent = folder.title;
    label.appendChild(check);
    label.appendChild(span);
    li.appendChild(label);

//  recurse and create sub folders
    if (folder.children) {

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
  for ( let i in inputs ) {
    inputs[i].checked = isChecked;
  }
}


// Events

function toggleFolder(inputs) {

  let folderIDList = {};

  inputs.forEach(input => {
    folderIDList[input.value] = input.checked;
  });

  chrome.runtime.sendMessage({
    action: 'toggleFolder',
    folders: folderIDList
  });
}


listEl.addEventListener('click', event => {

  let possibleTargets = listEl.querySelectorAll('input');

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
