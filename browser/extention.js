const jquery = document.createElement('script');
jquery.src = chrome.runtime.getURL('js/jquery-3.4.1.min.js');
jquery.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(jquery);

const socketio = document.createElement('script');
socketio.src = chrome.runtime.getURL('js/socket.io.slim.js');
socketio.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(socketio);

const lib = document.createElement('script');
lib.src = chrome.runtime.getURL('lib.user.js');
lib.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(lib);