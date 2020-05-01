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
var Message;
(function (Message) {
    Message["PLAY"] = "play";
    Message["PAUSE"] = "pause";
    Message["SEEK"] = "seek";
})(Message || (Message = {}));
class Player {
    constructor(options) {
        this.options = options;
    }
    create(videoId, sessionId) {
        this.ytPlayer = new window.YT.Player('ytd-player', {
            width: "100%",
            height: "100%",
            videoId,
            playerVars: {
                color: "red",
                autoplay: 1 /* AutoPlay */
            },
            events: {
                onReady: (e) => this.onReady(e, sessionId),
                onStateChange: (e) => this.onStateChange(e)
            }
        });
        window.cucu = {};
        window.cucu.player = this.ytPlayer;
    }
    onReady(_, sessionId) {
        this.connectWs(sessionId);
        schedule_1.startSeekCheck(this.ytPlayer, 1000, () => this.onPlayerSeek());
        schedule_1.startUrlChangeCheck(1000, (o, n) => this.onUrlChange(o, n));
    }
    onStateChange(event) {
        switch (event.data) {
            case 1 /* PLAYING */:
                this.sendWsMessage(Message.PLAY);
                break;
            case 2 /* PAUSED */:
                this.sendWsMessage(Message.PAUSE);
                break;
        }
    }
    onPlayerSeek() {
        this.sendWsMessage(Message.SEEK);
    }
    sendWsMessage(message) {
        this.ws.send(`${message} ${this.ytPlayer.getCurrentTime()}`);
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
        console.log(`Message received: ${message}`);
        try {
            const videoTime = parseFloat(data);
            switch (command) {
                case Message.PLAY.toString():
                    if (Math.abs(videoTime - player.ytPlayer.getCurrentTime() - 1) > 1.0) {
                        player.ytPlayer.seekTo(videoTime, true);
                    }
                    if (player.ytPlayer.getPlayerState() !== 1 /* PLAYING */) {
                        player.ytPlayer.playVideo();
                    }
                    break;
                case Message.PAUSE.toString():
                    if (Math.abs(videoTime - player.ytPlayer.getCurrentTime() - 1) > 1.0) {
                        player.ytPlayer.seekTo(videoTime, true);
                    }
                    if (player.ytPlayer.getPlayerState() !== 2 /* PAUSED */) {
                        player.ytPlayer.pauseVideo();
                    }
                    break;
                case Message.SEEK.toString():
                    player.ytPlayer.seekTo(videoTime, true);
                    break;
            }
        }
        catch (e) {
            console.error(e);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL2NvbnN0cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zY2hlZHVsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvd2Vic29ja2V0LnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3l0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2xGQSx3RkFBc0U7QUFDdEUsa0ZBQTBDO0FBQzFDLHlFQUErQztBQWMvQyxJQUFLLE9BSUo7QUFKRCxXQUFLLE9BQU87SUFDUix3QkFBYTtJ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Q0FBQyxDQUFDLENBQUMsQ0FBQztTQUNDLE1BQU0sQ0FBQyxVQUFVLENBQUM7U0FDbEIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRTdCLENBQUMsQ0FBQyxlQUFlLENBQUM7U0FDYixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFaEIsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztJQUN0QyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztTQUM5QixNQUFNLENBQUMsU0FBUyxDQUFDO1NBQ2pCLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVmLENBQUMsQ0FBQyxTQUFTLENBQUM7U0FDUCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsQ0FBQztBQWpDRCx3REFpQ0MiLCJmaWxlIjoibGliLnVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9wbHVnaW4udHNcIik7XG4iLCJpbXBvcnQgeyBzdGFydFNlZWtDaGVjaywgc3RhcnRVcmxDaGFuZ2VDaGVjayB9IGZyb20gXCIuL3V0aWwvc2NoZWR1bGVcIjtcbmltcG9ydCB7IFNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvY29uc3RzXCI7XG5pbXBvcnQgeyBjaGFuZ2VRdWVyeVN0cmluZyB9IGZyb20gXCIuL3V0aWwvdXJsXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgV2luZG93IHsgY3VjdTogYW55OyB9XG59XG5cbmludGVyZmFjZSBQbGF5ZXJPcHRpb25zIHtcbiAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgICAgIGhvc3Q6IHN0cmluZztcbiAgICAgICAgcG9ydDogc3RyaW5nO1xuICAgIH07XG59XG5cbmVudW0gTWVzc2FnZSB7XG4gICAgUExBWSA9IFwicGxheVwiLFxuICAgIFBBVVNFID0gXCJwYXVzZVwiLFxuICAgIFNFRUsgPSBcInNlZWtcIlxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXIge1xuICAgIHByaXZhdGUgeXRQbGF5ZXI6IFlULlBsYXllcjtcbiAgICBwdWJsaWMgd3M6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcbiAgICBwcml2YXRlIG9wdGlvbnM6IFBsYXllck9wdGlvbnM7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQbGF5ZXJPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZSh2aWRlb0lkOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgd2luZG93LllULlBsYXllcigneXRkLXBsYXllcicsIHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICB2aWRlb0lkLFxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xuICAgICAgICAgICAgICAgIGNvbG9yOiBcInJlZFwiLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBZVC5BdXRvUGxheS5BdXRvUGxheVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIG9uUmVhZHk6IChlKSA9PiB0aGlzLm9uUmVhZHkoZSwgc2Vzc2lvbklkKSxcbiAgICAgICAgICAgICAgICBvblN0YXRlQ2hhbmdlOiAoZSkgPT4gdGhpcy5vblN0YXRlQ2hhbmdlKGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5jdWN1ID0ge307XG4gICAgICAgIHdpbmRvdy5jdWN1LnBsYXllciA9IHRoaXMueXRQbGF5ZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlYWR5KF86IFlULlBsYXllckV2ZW50LCBzZXNzaW9uSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLmNvbm5lY3RXcyhzZXNzaW9uSWQpO1xuXG4gICAgICAgIHN0YXJ0U2Vla0NoZWNrKHRoaXMueXRQbGF5ZXIsIDEwMDAsICgpID0+IHRoaXMub25QbGF5ZXJTZWVrKCkpO1xuICAgICAgICBzdGFydFVybENoYW5nZUNoZWNrKDEwMDAsIChvLCBuKSA9PiB0aGlzLm9uVXJsQ2hhbmdlKG8sIG4pKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RhdGVDaGFuZ2UoZXZlbnQ6IFlULk9uU3RhdGVDaGFuZ2VFdmVudCk6IHZvaWQge1xuICAgICAgICBzd2l0Y2goZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgY2FzZSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUExBWUlORzpcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5QTEFZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2Ugd2luZG93LllULlBsYXllclN0YXRlLlBBVVNFRDpcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5QQVVTRSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUGxheWVyU2VlaygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zZW5kV3NNZXNzYWdlKE1lc3NhZ2UuU0VFSyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kV3NNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZykge1xuICAgICAgICB0aGlzLndzLnNlbmQoYCR7bWVzc2FnZX0gJHt0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCl9YCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblVybENoYW5nZShvOiBMb2NhdGlvbiwgbjogTG9jYXRpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb2xkUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhvLnNlYXJjaCk7XG4gICAgICAgIGNvbnN0IG5ld1BhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobi5zZWFyY2gpO1xuXG4gICAgICAgIGNvbnN0IG9sZFNlc3Npb25JZCA9IG9sZFBhcmFtcy5nZXQoU2Vzc2lvbklkKTtcbiAgICAgICAgY29uc3QgbmV3U2Vzc2lvbklkID0gbmV3UGFyYW1zLmdldChTZXNzaW9uSWQpO1xuICAgICAgICBpZihvbGRTZXNzaW9uSWQgIT09IG51bGwgJiYgbmV3U2Vzc2lvbklkID09PSBudWxsKSB7XG4gICAgICAgICAgICBuZXdQYXJhbXMuc2V0KFNlc3Npb25JZCwgb2xkU2Vzc2lvbklkKTtcbiAgICAgICAgICAgIGNoYW5nZVF1ZXJ5U3RyaW5nKG5ld1BhcmFtcy50b1N0cmluZygpLCB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25uZWN0V3Moc2Vzc2lvbklkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBwcm90b2NvbCwgaG9zdCwgcG9ydCB9ID0gdGhpcy5vcHRpb25zLmNvbm5lY3Rpb247XG5cbiAgICAgICAgdGhpcy53cyA9IGlvKGAke3Byb3RvY29sfTovLyR7aG9zdH06JHtwb3J0fS8ke3Nlc3Npb25JZH1gLCB7XG4gICAgICAgICAgICBhdXRvQ29ubmVjdDogdHJ1ZSxcbiAgICAgICAgICAgIHBhdGg6ICcvc29ja2V0LmlvJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53cy5vbignY29ubmVjdCcsICgpID0+IHRoaXMub25Xc0Nvbm5lY3RlZCgpKTtcbiAgICAgICAgdGhpcy53cy5vbignbWVzc2FnZScsIChkOiBzdHJpbmcpID0+IHRoaXMub25Xc01lc3NhZ2UoZCwgdGhpcykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Xc0Nvbm5lY3RlZCgpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDb25uZWN0ZWRcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldzTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcsIHBsYXllcjogUGxheWVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IFtjb21tYW5kLCBkYXRhXSA9IG1lc3NhZ2Uuc3BsaXQoXCIgXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhgTWVzc2FnZSByZWNlaXZlZDogJHttZXNzYWdlfWApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB2aWRlb1RpbWUgPSBwYXJzZUZsb2F0KGRhdGEpO1xuXG4gICAgICAgICAgICBzd2l0Y2goY29tbWFuZCkge1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5QTEFZLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyh2aWRlb1RpbWUgLSBwbGF5ZXIueXRQbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSAtIDEpID4gMS4wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIuc2Vla1RvKHZpZGVvVGltZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZihwbGF5ZXIueXRQbGF5ZXIuZ2V0UGxheWVyU3RhdGUoKSAhPT0gWVQuUGxheWVyU3RhdGUuUExBWUlORykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnBsYXlWaWRlbygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5QQVVTRS50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnModmlkZW9UaW1lIC0gcGxheWVyLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkgLSAxKSA+IDEuMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnNlZWtUbyh2aWRlb1RpbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYocGxheWVyLnl0UGxheWVyLmdldFBsYXllclN0YXRlKCkgIT09IFlULlBsYXllclN0YXRlLlBBVVNFRCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2UuU0VFSy50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIuc2Vla1RvKHZpZGVvVGltZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoKGUpIHsgY29uc29sZS5lcnJvcihlKTsgfVxuICAgIH1cblxufSIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgeyBpbmplY3RZdFJlbmRlcmVkQnV0dG9uLCBjcmVhdGVQbHVzSWNvbiB9IGZyb20gXCIuL3V0aWwveXQtaHRtbFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGVTZXNzaW9uSWQgfSBmcm9tIFwiLi91dGlsL3dlYnNvY2tldFwiO1xuaW1wb3J0IHsgU2Vzc2lvbklkIH0gZnJvbSBcIi4vdXRpbC9jb25zdHNcIjtcblxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXG4gICAgY29uc3QgcGxheWVyID0gbmV3IFBsYXllcih7XG4gICAgICAgIGNvbm5lY3Rpb246IHtcbiAgICAgICAgICAgIHByb3RvY29sOiAnaHR0cCcsXG4gICAgICAgICAgICBob3N0OiAnMTI3LjAuMC4xJyxcbiAgICAgICAgICAgIHBvcnQ6ICc4MDgwJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCB2aWRlb0lkID0gdXJsUGFyYW1zLmdldCgndicpO1xuICAgIGNvbnN0IHNlc3Npb25JZCA9IHVybFBhcmFtcy5nZXQoU2Vzc2lvbklkKTtcblxuICAgIGlmIChzZXNzaW9uSWQgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgaW5qZWN0U3luY0J1dHRvbkludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIikpIHtcbiAgICAgICAgICAgICAgICBpbmplY3RZdFJlbmRlcmVkQnV0dG9uKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIsIFwiY3JlYXRlLXN5bmMtYnV0dG9uXCIsIFwiQ3JlYXRlIFN5bmNcIiwgY3JlYXRlUGx1c0ljb24oKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXMuc2V0KFNlc3Npb25JZCwgZ2VuZXJhdGVTZXNzaW9uSWQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggPSB1cmxQYXJhbXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGluamVjdFN5bmNCdXR0b25JbnRlcnZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBwbGF5ZXIuY3JlYXRlKHZpZGVvSWQsIHNlc3Npb25JZCk7XG4gICAgfVxufTsiLCJleHBvcnQgY29uc3QgU2Vzc2lvbklkID0gJ3N5bmNJZCc7IiwiZXhwb3J0IGNvbnN0IHN0YXJ0U2Vla0NoZWNrID0gKHBsYXllcjogWVQuUGxheWVyLCBpbnRlcnZhbDogbnVtYmVyLCBjYjogKCkgPT4gdm9pZCk6ICgpID0+IHZvaWQgPT4ge1xuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI5MjkzODc3L2hvdy10by1saXN0ZW4tdG8tc2Vlay1ldmVudC1pbi15b3V0dWJlLWVtYmVkLWFwaVxuICAgIGxldCBsYXN0VGltZSA9IC0xO1xuXG4gICAgY29uc3QgY2hlY2tQbGF5ZXJUaW1lID0gKCkgPT4ge1xuICAgICAgICBpZiAobGFzdFRpbWUgIT09IC0xKSB7XG4gICAgICAgICAgICBpZihwbGF5ZXIuZ2V0UGxheWVyU3RhdGUoKSA9PT0gd2luZG93LllULlBsYXllclN0YXRlLlBMQVlJTkcgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0aW5nIDEgc2Vjb25kIGludGVydmFsICwgd2l0aCA1MDAgbXMgbWFyZ2luXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRpbWUgLSBsYXN0VGltZSAtIDEpID4gMC41KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZXJlIHdhcyBhIHNlZWsgb2NjdXJpbmdcbiAgICAgICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGFzdFRpbWUgPSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHNldEludGVydmFsKGNoZWNrUGxheWVyVGltZSwgaW50ZXJ2YWwpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICB9O1xufTtcblxuXG5leHBvcnQgY29uc3Qgc3RhcnRVcmxDaGFuZ2VDaGVjayA9IChpbnRlcnZhbDogbnVtYmVyLCBjYjogKG86IExvY2F0aW9uLCBuOiBMb2NhdGlvbikgPT4gdm9pZCk6ICgpID0+IHZvaWQgPT4ge1xuICAgIGxldCBvbGQ6IExvY2F0aW9uID0gbnVsbDtcbiAgICBjb25zdCBjaGVja1VSTCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHdpbmRvdy5sb2NhdGlvbjtcblxuICAgICAgICBpZihvbGQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIG9sZCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY3VycmVudCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9sZC5ocmVmICE9PSBjdXJyZW50LmhyZWYpIHtcbiAgICAgICAgICAgIGNiKG9sZCwgY3VycmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBvbGQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGN1cnJlbnQpKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHNldEludGVydmFsKGNoZWNrVVJMLCBpbnRlcnZhbCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgIH07XG59OyIsImV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VRdWVyeVN0cmluZyhzZWFyY2hTdHJpbmcsIGRvY3VtZW50VGl0bGUpIHtcbiAgICBkb2N1bWVudFRpdGxlID0gdHlwZW9mIGRvY3VtZW50VGl0bGUgIT09ICd1bmRlZmluZWQnID8gZG9jdW1lbnRUaXRsZSA6IGRvY3VtZW50LnRpdGxlO1xuICAgIGNvbnN0IHVybFNwbGl0ID0gKHdpbmRvdy5sb2NhdGlvbi5ocmVmKS5zcGxpdChcIj9cIik7XG4gICAgY29uc3Qgb2JqID0ge1xuICAgICAgICBUaXRsZTogZG9jdW1lbnRUaXRsZSxcbiAgICAgICAgVXJsOiB1cmxTcGxpdFswXSArICc/JyArIHNlYXJjaFN0cmluZ1xuICAgIH07XG5cbiAgICBoaXN0b3J5LnB1c2hTdGF0ZShvYmosIG9iai5UaXRsZSwgb2JqLlVybCk7XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU2Vzc2lvbklkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSkgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpO1xufSIsImV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQbHVzSWNvbigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDxzdmdcbiAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgICAgcHJlc2VydmVBc3BlY3RSYXRpbz1cInhNaWRZTWlkIG1lZXRcIlxuICAgICAgICAgICAgZm9jdXNhYmxlPVwiZmFsc2VcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCJcbiAgICAgICAgICAgIHN0eWxlPVwicG9pbnRlci1ldmVudHM6IG5vbmU7IGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlO1wiXG4gICAgICAgID5cbiAgICAgICAgICAgIDxnIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTkgMTNoLTZ2NmgtMnYtNkg1di0yaDZWNWgydjZoNnYyelwiIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiIC8+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgIDwvc3ZnPlxuICAgIGApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEljb25TaGVsbCgpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWljb24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIgLz5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uQnV0dG9uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uLWJ1dHRvbiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiBpZD1cImJ1dHRvblwiPmApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEZvcm1hdHRlZFN0cmluZyhjYjogKCkgPT4gdm9pZCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtZm9ybWF0dGVkLXN0cmluZyBpZD1cInRleHRcIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiAvPmApXG4gICAgICAgIC5jbGljayhjYik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0UmVuZGVyZWRCdXR0b25Db250YWluZXIoaWQ6IHN0cmluZyk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1idXR0b24tcmVuZGVyZXIgaWQ9XCIke2lkfVwiIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLW1lbnUtcmVuZGVyZXIgZm9yY2UtaWNvbi1idXR0b24gc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiBidXR0b24tcmVuZGVyZXI9XCJcIiB1c2Uta2V5Ym9hcmQtZm9jdXNlZD1cIlwiIGlzLWljb24tYnV0dG9uPVwiXCIgLz5cbiAgICBgKTtcbn1cblxuLyoqXG4gKiBJbmplY3QgYSBZdFJlbmRlcmVkQnV0dG9uIGludG8gYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIG9iaklkIFRoZSBJZCBvZiB0aGUgb2JqZWN0IHRoZSBZdFJlbmRlcmVkQnV0dG9uIHNob3VsZCBiZSBpbmplY3RlZCB0b1xuICogQHBhcmFtIHRleHQgVGhlIHRleHQgb2YgdGhlIGJ1dHRvblxuICogQHBhcmFtIGljb24gVGhlIGljb24gb2YgdGhlIGJ1dHRvbiAobmVlZHMgdG8gYmUgYSBzdmcgRWxlbWVudClcbiAqIEBwYXJhbSBjYiBUaGUgZnVuY3Rpb24gdGhhdCBzaG91bGQgYmUgY2FsbGVkIG9uIGJ1dHRvbiBjbGlja1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbihvYmpJZDogc3RyaW5nLCBjb250YWluZXJJZDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcsIGljb246IEpRdWVyeTxIVE1MRWxlbWVudD4sIGNiOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgLy8gVGhlIGNvbXBsZXRlIGJ1dHRvbiBuZWVkcyB0byBiZSBpbmplY3RlZCBleGFjdGx5IGxpa2UgdGhpc1xuICAgIC8vIGJlY2F1c2Ugd2hlbiB3ZSBpbmplY3QgdGhlIGNvbXBsZXRlbHkgYnVpbGQgYnV0dG9uXG4gICAgLy8gWVQgcmVtb3ZlcyBhbGwgaXRzIGNvbnRlbnQgc28gd2UgbmVlZCB0byBwYXJ0aWFsbHkgaW5qZWN0XG4gICAgLy8gZXZlcnl0aGluZyBpbiBvcmRlciB0byBnZXQgaXQgdG8gd29ya1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGNyZWF0ZVl0UmVuZGVyZWRCdXR0b25Db250YWluZXIoY29udGFpbmVySWQpO1xuICAgICQob2JqSWQpXG4gICAgICAgIC5hcHBlbmQoY29udGFpbmVyKTtcblxuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAkKGEpXG4gICAgICAgIC5hZGRDbGFzcyhcInl0LXNpbXBsZS1lbmRwb2ludCBzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIpXG4gICAgICAgIC5hdHRyKFwidGFiaW5kZXhcIiwgLTEpO1xuXG4gICAgJChjb250YWluZXIpXG4gICAgICAgIC5hcHBlbmQoYSk7XG5cbiAgICBjb25zdCBpY29uQnV0dG9uID0gY3JlYXRlWXRJY29uQnV0dG9uU2hlbGwoKTtcbiAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBjcmVhdGVZdEZvcm1hdHRlZFN0cmluZyhjYik7XG4gICAgJChhKVxuICAgICAgICAuYXBwZW5kKGljb25CdXR0b24pXG4gICAgICAgIC5hcHBlbmQoZm9ybWF0dGVkU3RyaW5nKTtcblxuICAgICQoZm9ybWF0dGVkU3RyaW5nKVxuICAgICAgICAudGV4dCh0ZXh0KTtcblxuICAgIGNvbnN0IGljb25TaGVsbCA9IGNyZWF0ZVl0SWNvblNoZWxsKCk7XG4gICAgJChpY29uQnV0dG9uKS5maW5kKFwiYnV0dG9uI2J1dHRvblwiKVxuICAgICAgICAuYXBwZW5kKGljb25TaGVsbClcbiAgICAgICAgLmNsaWNrKGNiKTtcblxuICAgICQoaWNvblNoZWxsKVxuICAgICAgICAuYXBwZW5kKGljb24pO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==