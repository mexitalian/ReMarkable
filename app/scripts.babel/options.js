'use strict';

let $ = function(q) {
  let result = document.querySelectorAll(q);
  return result.length === 1 ? result[0] : result;
};
let $new = tag => document.createElement(tag);

function toggleFolder(input) {

  chrome.runtime.sendMessage({
    action: 'toggleFolder',
    id: input.value,
    isSelected: input.checked
  });
}


let bgJS = chrome.extension.getBackgroundPage();
let listEl = $('#folder-list');
let frag = document.createDocumentFragment();

// create the checklist
bgJS.folders.forEach(folder => {

  let check = $new('input');
  let span  = $new('span');
  let label = $new('label');

  check.setAttribute('type','checkbox');
  check.value = folder.id;
  check.checked = Boolean( bgJS.folderIDs.find( id => id===folder.id ) );

  span.textContent = folder.title;
  label.appendChild(check);
  label.appendChild(span);

  frag.appendChild(label);

});

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
        console.log(el);
        toggleFolder(el);
      }
      el = el.parentNode;
    }
  }
  
});

listEl.appendChild(frag);
