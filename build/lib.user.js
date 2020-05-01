// ==UserScript==
// @name         YT Sync
// @namespace    https://tandashi.de
// @version      0.1
// @description  try to take over the world!
// @author       Tandashi
// @match        https://www.youtube.com/*
// @grant        none
//
// @run-at      document-end
//
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.slim.js
// @require https://www.youtube.com/iframe_api
//
// ==/UserScript==
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/plugin.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/player.ts":
/*!***********************!*\
  !*** ./src/player.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const schedule_1 = __webpack_require__(/*! ./util/schedule */ "./src/util/schedule.ts");
const consts_1 = __webpack_require__(/*! ./util/consts */ "./src/util/consts.ts");
const url_1 = __webpack_require__(/*! ./util/url */ "./src/util/url.ts");
var Messages;
(function (Messages) {
    Messages["PLAY"] = "play";
    Messages["PAUSE"] = "pause";
    Messages["SEEK"] = "seek";
})(Messages || (Messages = {}));
class Player {
    constructor(options) {
        this.options = options;
    }
    create(videoId, sessionId) {
        this.connectWs(sessionId);
        this.ytPlayer = new window.YT.Player('ytd-player', {
            width: "100%",
            height: "100%",
            videoId,
            playerVars: {
                color: "red",
                autoplay: 1 /* AutoPlay */
            },
            events: {
                onReady: (e) => this.onReady(e),
                onStateChange: (e) => this.onStateChange(e)
            }
        });
        window.cucu = {};
        window.cucu.player = this.ytPlayer;
    }
    onReady(_) {
        this.ytPlayer.pauseVideo();
        schedule_1.startSeekCheck(this.ytPlayer, 500, () => this.onPlayerSeek());
        schedule_1.startUrlChangeCheck(1000, (o, n) => this.onUrlChange(o, n));
    }
    onStateChange(event) {
        console.log(`New State ${event.data}`);
        switch (event.data) {
            case 1 /* PLAYING */:
                console.log(Messages.PLAY);
                this.ws.send(Messages.PLAY);
                break;
            case 2 /* PAUSED */:
                console.log(Messages.PAUSE);
                this.ws.send(Messages.PAUSE);
                break;
        }
    }
    onPlayerSeek() {
        console.log(`${Messages.SEEK} ${this.ytPlayer.getCurrentTime()}`);
        this.ws.send(`${Messages.SEEK} ${this.ytPlayer.getCurrentTime()}`);
    }
    onUrlChange(o, n) {
        const oldParams = new URLSearchParams(o.search);
        const newParams = new URLSearchParams(n.search);
        const oldSessionId = oldParams.get(consts_1.SessionId);
        const newSessionId = newParams.get(consts_1.SessionId);
        if (oldSessionId !== null && newSessionId === null) {
            newParams.set(consts_1.SessionId, oldSessionId);
            url_1.changeQueryString(newParams.toString(), undefined);
        }
    }
    connectWs(sessionId) {
        const { protocol, host, port } = this.options.connection;
        this.ws = io(`${protocol}://${host}:${port}/${sessionId}`, {
            autoConnect: true,
            path: '/socket.io'
        });
        this.ws.on('connect', () => this.onWsConnected());
        this.ws.on('message', (d) => this.onWsMessage(d, this));
    }
    onWsConnected() {
        console.log("Connected");
    }
    onWsMessage(message, player) {
        const [command, data] = message.split(" ");
        switch (command) {
            case Messages.PLAY.toString():
                player.ytPlayer.playVideo();
                break;
            case Messages.PAUSE.toString():
                player.ytPlayer.pauseVideo();
                break;
            case Messages.SEEK.toString():
                player.ytPlayer.seekTo(parseFloat(data), true);
                break;
        }
    }
}
exports.default = Player;


/***/ }),

/***/ "./src/plugin.ts":
/*!***********************!*\
  !*** ./src/plugin.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = __importDefault(__webpack_require__(/*! ./player */ "./src/player.ts"));
const yt_html_1 = __webpack_require__(/*! ./util/yt-html */ "./src/util/yt-html.ts");
const websocket_1 = __webpack_require__(/*! ./util/websocket */ "./src/util/websocket.ts");
const consts_1 = __webpack_require__(/*! ./util/consts */ "./src/util/consts.ts");
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const player = new player_1.default({
        connection: {
            protocol: 'http',
            host: '127.0.0.1',
            port: '8080'
        }
    });
    const videoId = urlParams.get('v');
    const sessionId = urlParams.get(consts_1.SessionId);
    if (sessionId === null) {
        const injectSyncButtonInterval = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                yt_html_1.injectYtRenderedButton("div#info ytd-menu-renderer div#top-level-buttons", "create-sync-button", "Create Sync", yt_html_1.createPlusIcon(), () => {
                    urlParams.set(consts_1.SessionId, websocket_1.generateSessionId());
                    window.location.search = urlParams.toString();
                });
                clearInterval(injectSyncButtonInterval);
            }
        }, 500);
    }
    else {
        player.create(videoId, sessionId);
    }
};


/***/ }),

/***/ "./src/util/consts.ts":
/*!****************************!*\
  !*** ./src/util/consts.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionId = 'syncId';


/***/ }),

/***/ "./src/util/schedule.ts":
/*!******************************!*\
  !*** ./src/util/schedule.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.startSeekCheck = (player, interval, cb) => {
    // https://stackoverflow.com/questions/29293877/how-to-listen-to-seek-event-in-youtube-embed-api
    let lastTime = -1;
    const checkPlayerTime = () => {
        if (lastTime !== -1) {
            if (player.getPlayerState() === 1 /* PLAYING */) {
                const time = player.getCurrentTime();
                // expecting 1 second interval , with 500 ms margin
                if (Math.abs(time - lastTime - 1) > 0.5) {
                    // there was a seek occuring
                    cb();
                }
            }
        }
        lastTime = player.getCurrentTime();
    };
    const handler = setInterval(checkPlayerTime, interval);
    return () => {
        clearTimeout(handler);
    };
};
exports.startUrlChangeCheck = (interval, cb) => {
    let old = null;
    const checkURL = () => {
        const current = window.location;
        if (old === null) {
            old = JSON.parse(JSON.stringify(current));
        }
        if (old.href !== current.href) {
            cb(old, current);
        }
        old = JSON.parse(JSON.stringify(current));
    };
    const handler = setInterval(checkURL, interval);
    return () => {
        clearTimeout(handler);
    };
};


/***/ }),

/***/ "./src/util/url.ts":
/*!*************************!*\
  !*** ./src/util/url.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function changeQueryString(searchString, documentTitle) {
    documentTitle = typeof documentTitle !== 'undefined' ? documentTitle : document.title;
    const urlSplit = (window.location.href).split("?");
    const obj = {
        Title: documentTitle,
        Url: urlSplit[0] + '?' + searchString
    };
    history.pushState(obj, obj.Title, obj.Url);
}
exports.changeQueryString = changeQueryString;


/***/ }),

/***/ "./src/util/websocket.ts":
/*!*******************************!*\
  !*** ./src/util/websocket.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
exports.generateSessionId = generateSessionId;


/***/ }),

/***/ "./src/util/yt-html.ts":
/*!*****************************!*\
  !*** ./src/util/yt-html.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function createPlusIcon() {
    return $(`
        <svg
            viewBox="0 0 24 24"
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
            class="style-scope yt-icon"
            style="pointer-events: none; display: block; width: 100%; height: 100%;"
        >
            <g class="style-scope yt-icon">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" class="style-scope yt-icon" />
            </g>
        </svg>
    `);
}
exports.createPlusIcon = createPlusIcon;
function createYtIconShell() {
    return $(`<yt-icon class="style-scope ytd-button-renderer" />`);
}
function createYtIconButtonShell() {
    return $(`<yt-icon-button class="style-scope ytd-button-renderer style-default size-default" id="button">`);
}
function createYtFormattedString(cb) {
    return $(`<yt-formatted-string id="text" class="style-scope ytd-button-renderer style-default size-default" />`)
        .click(cb);
}
function createYtRenderedButtonContainer(id) {
    return $(`
        <ytd-button-renderer id="${id}" class="style-scope ytd-menu-renderer force-icon-button style-default size-default" button-renderer="" use-keyboard-focused="" is-icon-button="" />
    `);
}
/**
 * Inject a YtRenderedButton into an object
 *
 * @param objId The Id of the object the YtRenderedButton should be injected to
 * @param text The text of the button
 * @param icon The icon of the button (needs to be a svg Element)
 * @param cb The function that should be called on button click
 */
function injectYtRenderedButton(objId, containerId, text, icon, cb) {
    // The complete button needs to be injected exactly like this
    // because when we inject the completely build button
    // YT removes all its content so we need to partially inject
    // everything in order to get it to work
    const container = createYtRenderedButtonContainer(containerId);
    $(objId)
        .append(container);
    const a = document.createElement("a");
    $(a)
        .addClass("yt-simple-endpoint style-scope ytd-button-renderer")
        .attr("tabindex", -1);
    $(container)
        .append(a);
    const iconButton = createYtIconButtonShell();
    const formattedString = createYtFormattedString(cb);
    $(a)
        .append(iconButton)
        .append(formattedString);
    $(formattedString)
        .text(text);
    const iconShell = createYtIconShell();
    $(iconButton).find("button#button")
        .append(iconShell)
        .click(cb);
    $(iconShell)
        .append(icon);
}
exports.injectYtRenderedButton = injectYtRenderedButton;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL2NvbnN0cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zY2hlZHVsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvd2Vic29ja2V0LnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3l0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2xGQSx3RkFBc0U7QUFDdEUsa0ZBQTBDO0FBQzFDLHlFQUErQztBQWMvQyxJQUFLLFFBSUo7QUFKRCxXQUFLLFFBQVE7SUFDVCx5QkFBYTtJ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XHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9wbHVnaW4udHNcIik7XG4iLCJpbXBvcnQgeyBzdGFydFNlZWtDaGVjaywgc3RhcnRVcmxDaGFuZ2VDaGVjayB9IGZyb20gXCIuL3V0aWwvc2NoZWR1bGVcIjtcbmltcG9ydCB7IFNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvY29uc3RzXCI7XG5pbXBvcnQgeyBjaGFuZ2VRdWVyeVN0cmluZyB9IGZyb20gXCIuL3V0aWwvdXJsXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgV2luZG93IHsgY3VjdTogYW55OyB9XG59XG5cbmludGVyZmFjZSBQbGF5ZXJPcHRpb25zIHtcbiAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgICAgIGhvc3Q6IHN0cmluZztcbiAgICAgICAgcG9ydDogc3RyaW5nO1xuICAgIH07XG59XG5cbmVudW0gTWVzc2FnZXMge1xuICAgIFBMQVkgPSBcInBsYXlcIixcbiAgICBQQVVTRSA9IFwicGF1c2VcIixcbiAgICBTRUVLID0gXCJzZWVrXCJcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyIHtcbiAgICBwcml2YXRlIHl0UGxheWVyOiBZVC5QbGF5ZXI7XG4gICAgcHVibGljIHdzOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQ7XG4gICAgcHJpdmF0ZSBvcHRpb25zOiBQbGF5ZXJPcHRpb25zO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogUGxheWVyT3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGUodmlkZW9JZDogc3RyaW5nLCBzZXNzaW9uSWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNvbm5lY3RXcyhzZXNzaW9uSWQpO1xuXG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgd2luZG93LllULlBsYXllcigneXRkLXBsYXllcicsIHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICB2aWRlb0lkLFxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xuICAgICAgICAgICAgICAgIGNvbG9yOiBcInJlZFwiLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBZVC5BdXRvUGxheS5BdXRvUGxheVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIG9uUmVhZHk6IChlKSA9PiB0aGlzLm9uUmVhZHkoZSksXG4gICAgICAgICAgICAgICAgb25TdGF0ZUNoYW5nZTogKGUpID0+IHRoaXMub25TdGF0ZUNoYW5nZShlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuY3VjdSA9IHt9O1xuICAgICAgICB3aW5kb3cuY3VjdS5wbGF5ZXIgPSB0aGlzLnl0UGxheWVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25SZWFkeShfOiBZVC5QbGF5ZXJFdmVudCk6IHZvaWQge1xuICAgICAgICB0aGlzLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcblxuICAgICAgICBzdGFydFNlZWtDaGVjayh0aGlzLnl0UGxheWVyLCA1MDAsICgpID0+IHRoaXMub25QbGF5ZXJTZWVrKCkpO1xuICAgICAgICBzdGFydFVybENoYW5nZUNoZWNrKDEwMDAsIChvLCBuKSA9PiB0aGlzLm9uVXJsQ2hhbmdlKG8sIG4pKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RhdGVDaGFuZ2UoZXZlbnQ6IFlULk9uU3RhdGVDaGFuZ2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgTmV3IFN0YXRlICR7ZXZlbnQuZGF0YX1gKTtcbiAgICAgICAgc3dpdGNoKGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIGNhc2Ugd2luZG93LllULlBsYXllclN0YXRlLlBMQVlJTkc6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coTWVzc2FnZXMuUExBWSk7XG4gICAgICAgICAgICAgICAgdGhpcy53cy5zZW5kKE1lc3NhZ2VzLlBMQVkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUEFVU0VEOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKE1lc3NhZ2VzLlBBVVNFKTtcbiAgICAgICAgICAgICAgICB0aGlzLndzLnNlbmQoTWVzc2FnZXMuUEFVU0UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblBsYXllclNlZWsoKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke01lc3NhZ2VzLlNFRUt9ICR7dGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpfWApO1xuICAgICAgICB0aGlzLndzLnNlbmQoYCR7TWVzc2FnZXMuU0VFS30gJHt0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCl9YCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblVybENoYW5nZShvOiBMb2NhdGlvbiwgbjogTG9jYXRpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb2xkUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhvLnNlYXJjaCk7XG4gICAgICAgIGNvbnN0IG5ld1BhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobi5zZWFyY2gpO1xuXG4gICAgICAgIGNvbnN0IG9sZFNlc3Npb25JZCA9IG9sZFBhcmFtcy5nZXQoU2Vzc2lvbklkKTtcbiAgICAgICAgY29uc3QgbmV3U2Vzc2lvbklkID0gbmV3UGFyYW1zLmdldChTZXNzaW9uSWQpO1xuICAgICAgICBpZihvbGRTZXNzaW9uSWQgIT09IG51bGwgJiYgbmV3U2Vzc2lvbklkID09PSBudWxsKSB7XG4gICAgICAgICAgICBuZXdQYXJhbXMuc2V0KFNlc3Npb25JZCwgb2xkU2Vzc2lvbklkKTtcbiAgICAgICAgICAgIGNoYW5nZVF1ZXJ5U3RyaW5nKG5ld1BhcmFtcy50b1N0cmluZygpLCB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25uZWN0V3Moc2Vzc2lvbklkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBwcm90b2NvbCwgaG9zdCwgcG9ydCB9ID0gdGhpcy5vcHRpb25zLmNvbm5lY3Rpb247XG5cbiAgICAgICAgdGhpcy53cyA9IGlvKGAke3Byb3RvY29sfTovLyR7aG9zdH06JHtwb3J0fS8ke3Nlc3Npb25JZH1gLCB7XG4gICAgICAgICAgICBhdXRvQ29ubmVjdDogdHJ1ZSxcbiAgICAgICAgICAgIHBhdGg6ICcvc29ja2V0LmlvJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53cy5vbignY29ubmVjdCcsICgpID0+IHRoaXMub25Xc0Nvbm5lY3RlZCgpKTtcbiAgICAgICAgdGhpcy53cy5vbignbWVzc2FnZScsIChkOiBzdHJpbmcpID0+IHRoaXMub25Xc01lc3NhZ2UoZCwgdGhpcykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Xc0Nvbm5lY3RlZCgpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDb25uZWN0ZWRcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldzTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcsIHBsYXllcjogUGxheWVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IFtjb21tYW5kLCBkYXRhXSA9IG1lc3NhZ2Uuc3BsaXQoXCIgXCIpO1xuICAgICAgICBzd2l0Y2goY29tbWFuZCkge1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlcy5QTEFZLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnBsYXlWaWRlbygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlcy5QQVVTRS50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5wYXVzZVZpZGVvKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VzLlNFRUsudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIuc2Vla1RvKHBhcnNlRmxvYXQoZGF0YSksIHRydWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgUGxheWVyIGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IHsgaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbiwgY3JlYXRlUGx1c0ljb24gfSBmcm9tIFwiLi91dGlsL3l0LWh0bWxcIjtcbmltcG9ydCB7IGdlbmVyYXRlU2Vzc2lvbklkIH0gZnJvbSBcIi4vdXRpbC93ZWJzb2NrZXRcIjtcbmltcG9ydCB7IFNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvY29uc3RzXCI7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgIGNvbnN0IHBsYXllciA9IG5ldyBQbGF5ZXIoe1xuICAgICAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgICAgICBwcm90b2NvbDogJ2h0dHAnLFxuICAgICAgICAgICAgaG9zdDogJzEyNy4wLjAuMScsXG4gICAgICAgICAgICBwb3J0OiAnODA4MCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgdmlkZW9JZCA9IHVybFBhcmFtcy5nZXQoJ3YnKTtcbiAgICBjb25zdCBzZXNzaW9uSWQgPSB1cmxQYXJhbXMuZ2V0KFNlc3Npb25JZCk7XG5cbiAgICBpZiAoc2Vzc2lvbklkID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGluamVjdFN5bmNCdXR0b25JbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIpKSB7XG4gICAgICAgICAgICAgICAgaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbihcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiLCBcImNyZWF0ZS1zeW5jLWJ1dHRvblwiLCBcIkNyZWF0ZSBTeW5jXCIsIGNyZWF0ZVBsdXNJY29uKCksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsUGFyYW1zLnNldChTZXNzaW9uSWQsIGdlbmVyYXRlU2Vzc2lvbklkKCkpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uc2VhcmNoID0gdXJsUGFyYW1zLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbmplY3RTeW5jQnV0dG9uSW50ZXJ2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCA1MDApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcGxheWVyLmNyZWF0ZSh2aWRlb0lkLCBzZXNzaW9uSWQpO1xuICAgIH1cbn07IiwiZXhwb3J0IGNvbnN0IFNlc3Npb25JZCA9ICdzeW5jSWQnOyIsImV4cG9ydCBjb25zdCBzdGFydFNlZWtDaGVjayA9IChwbGF5ZXI6IFlULlBsYXllciwgaW50ZXJ2YWw6IG51bWJlciwgY2I6ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkID0+IHtcbiAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yOTI5Mzg3Ny9ob3ctdG8tbGlzdGVuLXRvLXNlZWstZXZlbnQtaW4teW91dHViZS1lbWJlZC1hcGlcbiAgICBsZXQgbGFzdFRpbWUgPSAtMTtcblxuICAgIGNvbnN0IGNoZWNrUGxheWVyVGltZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKGxhc3RUaW1lICE9PSAtMSkge1xuICAgICAgICAgICAgaWYocGxheWVyLmdldFBsYXllclN0YXRlKCkgPT09IHdpbmRvdy5ZVC5QbGF5ZXJTdGF0ZS5QTEFZSU5HICkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWUgPSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcblxuICAgICAgICAgICAgICAgIC8vIGV4cGVjdGluZyAxIHNlY29uZCBpbnRlcnZhbCAsIHdpdGggNTAwIG1zIG1hcmdpblxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aW1lIC0gbGFzdFRpbWUgLSAxKSA+IDAuNSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGVyZSB3YXMgYSBzZWVrIG9jY3VyaW5nXG4gICAgICAgICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxhc3RUaW1lID0gcGxheWVyLmdldEN1cnJlbnRUaW1lKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRJbnRlcnZhbChjaGVja1BsYXllclRpbWUsIGludGVydmFsKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgfTtcbn07XG5cblxuZXhwb3J0IGNvbnN0IHN0YXJ0VXJsQ2hhbmdlQ2hlY2sgPSAoaW50ZXJ2YWw6IG51bWJlciwgY2I6IChvOiBMb2NhdGlvbiwgbjogTG9jYXRpb24pID0+IHZvaWQpOiAoKSA9PiB2b2lkID0+IHtcbiAgICBsZXQgb2xkOiBMb2NhdGlvbiA9IG51bGw7XG4gICAgY29uc3QgY2hlY2tVUkwgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSB3aW5kb3cubG9jYXRpb247XG5cbiAgICAgICAgaWYob2xkID09PSBudWxsKSB7XG4gICAgICAgICAgICBvbGQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGN1cnJlbnQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvbGQuaHJlZiAhPT0gY3VycmVudC5ocmVmKSB7XG4gICAgICAgICAgICBjYihvbGQsIGN1cnJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgb2xkID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjdXJyZW50KSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRJbnRlcnZhbChjaGVja1VSTCwgaW50ZXJ2YWwpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICB9O1xufTsiLCJleHBvcnQgZnVuY3Rpb24gY2hhbmdlUXVlcnlTdHJpbmcoc2VhcmNoU3RyaW5nLCBkb2N1bWVudFRpdGxlKSB7XG4gICAgZG9jdW1lbnRUaXRsZSA9IHR5cGVvZiBkb2N1bWVudFRpdGxlICE9PSAndW5kZWZpbmVkJyA/IGRvY3VtZW50VGl0bGUgOiBkb2N1bWVudC50aXRsZTtcbiAgICBjb25zdCB1cmxTcGxpdCA9ICh3aW5kb3cubG9jYXRpb24uaHJlZikuc3BsaXQoXCI/XCIpO1xuICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgVGl0bGU6IGRvY3VtZW50VGl0bGUsXG4gICAgICAgIFVybDogdXJsU3BsaXRbMF0gKyAnPycgKyBzZWFyY2hTdHJpbmdcbiAgICB9O1xuXG4gICAgaGlzdG9yeS5wdXNoU3RhdGUob2JqLCBvYmouVGl0bGUsIG9iai5VcmwpO1xufSIsImV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVNlc3Npb25JZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KTtcbn0iLCJleHBvcnQgZnVuY3Rpb24gY3JlYXRlUGx1c0ljb24oKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8c3ZnXG4gICAgICAgICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgICAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW89XCJ4TWlkWU1pZCBtZWV0XCJcbiAgICAgICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgICAgIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiXG4gICAgICAgICAgICBzdHlsZT1cInBvaW50ZXItZXZlbnRzOiBub25lOyBkaXNwbGF5OiBibG9jazsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTtcIlxuICAgICAgICA+XG4gICAgICAgICAgICA8ZyBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIj5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTE5IDEzaC02djZoLTJ2LTZINXYtMmg2VjVoMnY2aDZ2MnpcIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIiAvPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICA8L3N2Zz5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLWJ1dHRvbi1yZW5kZXJlclwiIC8+YCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0SWNvbkJ1dHRvblNoZWxsKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtaWNvbi1idXR0b24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgaWQ9XCJidXR0b25cIj5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRGb3JtYXR0ZWRTdHJpbmcoY2I6ICgpID0+IHZvaWQpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWZvcm1hdHRlZC1zdHJpbmcgaWQ9XCJ0ZXh0XCIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgLz5gKVxuICAgICAgICAuY2xpY2soY2IpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdFJlbmRlcmVkQnV0dG9uQ29udGFpbmVyKGlkOiBzdHJpbmcpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDx5dGQtYnV0dG9uLXJlbmRlcmVyIGlkPVwiJHtpZH1cIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1tZW51LXJlbmRlcmVyIGZvcmNlLWljb24tYnV0dG9uIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgYnV0dG9uLXJlbmRlcmVyPVwiXCIgdXNlLWtleWJvYXJkLWZvY3VzZWQ9XCJcIiBpcy1pY29uLWJ1dHRvbj1cIlwiIC8+XG4gICAgYCk7XG59XG5cbi8qKlxuICogSW5qZWN0IGEgWXRSZW5kZXJlZEJ1dHRvbiBpbnRvIGFuIG9iamVjdFxuICpcbiAqIEBwYXJhbSBvYmpJZCBUaGUgSWQgb2YgdGhlIG9iamVjdCB0aGUgWXRSZW5kZXJlZEJ1dHRvbiBzaG91bGQgYmUgaW5qZWN0ZWQgdG9cbiAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IG9mIHRoZSBidXR0b25cbiAqIEBwYXJhbSBpY29uIFRoZSBpY29uIG9mIHRoZSBidXR0b24gKG5lZWRzIHRvIGJlIGEgc3ZnIEVsZW1lbnQpXG4gKiBAcGFyYW0gY2IgVGhlIGZ1bmN0aW9uIHRoYXQgc2hvdWxkIGJlIGNhbGxlZCBvbiBidXR0b24gY2xpY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFl0UmVuZGVyZWRCdXR0b24ob2JqSWQ6IHN0cmluZywgY29udGFpbmVySWQ6IHN0cmluZywgdGV4dDogc3RyaW5nLCBpY29uOiBKUXVlcnk8SFRNTEVsZW1lbnQ+LCBjYjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIC8vIFRoZSBjb21wbGV0ZSBidXR0b24gbmVlZHMgdG8gYmUgaW5qZWN0ZWQgZXhhY3RseSBsaWtlIHRoaXNcbiAgICAvLyBiZWNhdXNlIHdoZW4gd2UgaW5qZWN0IHRoZSBjb21wbGV0ZWx5IGJ1aWxkIGJ1dHRvblxuICAgIC8vIFlUIHJlbW92ZXMgYWxsIGl0cyBjb250ZW50IHNvIHdlIG5lZWQgdG8gcGFydGlhbGx5IGluamVjdFxuICAgIC8vIGV2ZXJ5dGhpbmcgaW4gb3JkZXIgdG8gZ2V0IGl0IHRvIHdvcmtcbiAgICBjb25zdCBjb250YWluZXIgPSBjcmVhdGVZdFJlbmRlcmVkQnV0dG9uQ29udGFpbmVyKGNvbnRhaW5lcklkKTtcbiAgICAkKG9iaklkKVxuICAgICAgICAuYXBwZW5kKGNvbnRhaW5lcik7XG5cbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgJChhKVxuICAgICAgICAuYWRkQ2xhc3MoXCJ5dC1zaW1wbGUtZW5kcG9pbnQgc3R5bGUtc2NvcGUgeXRkLWJ1dHRvbi1yZW5kZXJlclwiKVxuICAgICAgICAuYXR0cihcInRhYmluZGV4XCIsIC0xKTtcblxuICAgICQoY29udGFpbmVyKVxuICAgICAgICAuYXBwZW5kKGEpO1xuXG4gICAgY29uc3QgaWNvbkJ1dHRvbiA9IGNyZWF0ZVl0SWNvbkJ1dHRvblNoZWxsKCk7XG4gICAgY29uc3QgZm9ybWF0dGVkU3RyaW5nID0gY3JlYXRlWXRGb3JtYXR0ZWRTdHJpbmcoY2IpO1xuICAgICQoYSlcbiAgICAgICAgLmFwcGVuZChpY29uQnV0dG9uKVxuICAgICAgICAuYXBwZW5kKGZvcm1hdHRlZFN0cmluZyk7XG5cbiAgICAkKGZvcm1hdHRlZFN0cmluZylcbiAgICAgICAgLnRleHQodGV4dCk7XG5cbiAgICBjb25zdCBpY29uU2hlbGwgPSBjcmVhdGVZdEljb25TaGVsbCgpO1xuICAgICQoaWNvbkJ1dHRvbikuZmluZChcImJ1dHRvbiNidXR0b25cIilcbiAgICAgICAgLmFwcGVuZChpY29uU2hlbGwpXG4gICAgICAgIC5jbGljayhjYik7XG5cbiAgICAkKGljb25TaGVsbClcbiAgICAgICAgLmFwcGVuZChpY29uKTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=