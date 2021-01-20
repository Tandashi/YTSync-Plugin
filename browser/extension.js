const lib = document.createElement('script');
lib.src = chrome.runtime.getURL('lib.user.js');
lib.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(lib);