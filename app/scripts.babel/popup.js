'use strict';

var realBookmarks = [];

function filterBookmarks(bookmarks) {

    bookmarks.forEach(bookmark => {
      
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
  let randomIndex = Math.floor( Math.random() * realBookmarks.length );

    while (true) {
      console.log(randomIndex);
      if (realBookmarks[randomIndex].url) {
        return realBookmarks[randomIndex];
      }
      else {
        randomIndex = Math.floor( Math.random() * realBookmarks.length );
      }
    }
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

document.getElementById('get-bookmarks').addEventListener('click', function() {
  // chrome.bookmarks.getTree(getRandomMark);
  let mark = getRandomMark();
  console.log(mark.url);
  chrome.runtime.sendMessage({redirect: mark.url});
});


chrome.bookmarks.getTree(filterBookmarks);