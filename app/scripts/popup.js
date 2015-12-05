'use strict';

var realBookmarks = [];

function filterBookmarks(bookmarks) {

  bookmarks.forEach(function (bookmark) {

    if (bookmark.url) {
      realBookmarks.push(bookmark);
      // console.log('bookmark: ' + bookmark.title + ' ~  ' + bookmark.url);
    }

    if (bookmark.children) {
      filterBookmarks(bookmark.children);
    }
  });
}

function getRandomMark() {
  var randomIndex = Math.floor(Math.random() * realBookmarks.length);

  while (true) {
    console.log(randomIndex);
    if (realBookmarks[randomIndex].url) {
      return realBookmarks[randomIndex];
    } else {
      randomIndex = Math.floor(Math.random() * realBookmarks.length);
    }
  }
}

function minsToMillis(mins) {
  return mins * 60 * 1000;
}

// function justOne(bookmarks) {
//   while ( true ) {

//     bookmarks.forEach(function(bookmark) {
//       if (bookmark.url) {
//         console.log(bookmark);
//         break;
//       }
//     });
//   }
// };

document.getElementById('get-bookmarks').addEventListener('click', function () {
  // chrome.bookmarks.getTree(getRandomMark);
  var mark = getRandomMark();
  var mins = Math.round(document.getElementById('mins').value);

  console.log(mark.url);

  chrome.runtime.sendMessage({
    redirect: mark.url,
    millis: minsToMillis(mins)
  });
});

chrome.bookmarks.getTree(filterBookmarks);
//# sourceMappingURL=popup.js.map
