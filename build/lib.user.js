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
    Message["PLAY_VIDEO"] = "play-video";
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
                onReady: (e) => this.onReady(e, sessionId, videoId),
                onStateChange: (e) => this.onStateChange(e)
            }
        });
        window.cucu = {};
        window.cucu.player = this.ytPlayer;
    }
    onReady(_, sessionId, videoId) {
        schedule_1.startSeekCheck(this.ytPlayer, 1000, () => this.onPlayerSeek());
        schedule_1.startUrlChangeCheck(1000, (o, n) => this.onUrlChange(o, n));
        this.connectWs(sessionId);
        this.sendWsMessage(Message.PLAY_VIDEO, videoId);
    }
    onStateChange(event) {
        switch (event.data) {
            case 1 /* PLAYING */:
                this.sendWsTimeMessage(Message.PLAY);
                break;
            case 2 /* PAUSED */:
                this.sendWsTimeMessage(Message.PAUSE);
                break;
        }
    }
    onPlayerSeek() {
        this.sendWsTimeMessage(Message.SEEK);
    }
    sendWsTimeMessage(message) {
        this.sendWsMessage(message, this.ytPlayer.getCurrentTime().toString());
    }
    sendWsMessage(message, data) {
        this.ws.send(`${message} ${data}`);
    }
    onUrlChange(o, n) {
        console.log(`URL CHANGE: ${o.href} -> ${n.href}`);
        const oldParams = new URLSearchParams(o.search);
        const newParams = new URLSearchParams(n.search);
        const oldSessionId = oldParams.get(consts_1.SessionId);
        const newSessionId = newParams.get(consts_1.SessionId);
        if (oldSessionId !== null && newSessionId === null) {
            newParams.set(consts_1.SessionId, oldSessionId);
            url_1.changeQueryString(newParams.toString(), undefined);
        }
        const videoId = newParams.get('v');
        if (videoId !== null) {
            this.sendWsMessage(Message.PLAY_VIDEO, videoId);
            console.log(`Loading new VIDEO: ${videoId}`);
            this.ytPlayer.loadVideoById(videoId);
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
    syncPlayerTime(videoTime, margin = 1.0) {
        if (Math.abs(videoTime - this.ytPlayer.getCurrentTime()) > margin) {
            this.ytPlayer.seekTo(videoTime, true);
        }
    }
    onWsMessage(message, player) {
        const [command, data] = message.split(" ");
        console.log(`Message: ${message}`);
        try {
            const playerState = player.ytPlayer.getPlayerState();
            switch (command) {
                case Message.PLAY.toString():
                    console.log(`Player State: ${playerState}`);
                    player.syncPlayerTime(parseFloat(data));
                    if (playerState === 2 /* PAUSED */)
                        player.ytPlayer.playVideo();
                    break;
                case Message.PAUSE.toString():
                    player.syncPlayerTime(parseFloat(data));
                    if (playerState === 1 /* PLAYING */)
                        player.ytPlayer.pauseVideo();
                    break;
                case Message.SEEK.toString():
                    player.ytPlayer.seekTo(parseFloat(data), true);
                    break;
                case Message.PLAY_VIDEO.toString():
                    const params = new URLSearchParams(window.location.search);
                    params.set('v', data);
                    url_1.changeQueryString(params.toString(), undefined);
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
        const injectLeaveButtonInterval = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                yt_html_1.injectYtRenderedButton("div#info ytd-menu-renderer div#top-level-buttons", "create-sync-button", "Leave Sync", yt_html_1.createLeaveIcon(), () => {
                    urlParams.delete(consts_1.SessionId);
                    window.location.search = urlParams.toString();
                });
                clearInterval(injectLeaveButtonInterval);
            }
        }, 500);
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
    let old = JSON.parse(JSON.stringify(window.location));
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
function createLeaveIcon() {
    return $(`
        <svg
            viewBox="0 0 24 24"
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
            class="style-scope yt-icon"
            style="pointer-events: none; display: block; width: 100%; height: 100%;"
        >
            <g class="style-scope yt-icon">
                <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" class="style-scope yt-icon" />
            </g>
        </svg>
    `);
}
exports.createLeaveIcon = createLeaveIcon;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL2NvbnN0cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zY2hlZHVsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvd2Vic29ja2V0LnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3l0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2xGQSx3RkFBc0U7QUFDdEUsa0ZBQTBDO0FBQzFDLHlFQUErQztBQWMvQyxJQUFLLE9BS0o7QUFMRCxXQUFLLE9BQU87SUFDUix3QkFBYTtJ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QUFDLENBQUM7SUFDL0QsQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNILE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV2QixNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDQyxRQUFRLENBQUMsb0RBQW9ELENBQUM7U0FDOUQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTFCLENBQUMsQ0FBQyxTQUFTLENBQUM7U0FDUCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFZixNQUFNLFVBQVUsR0FBRyx1QkFBdUIsRUFBRSxDQUFDO0lBQzdDLE1BQU0sZUFBZSxHQUFHLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDQyxNQUFNLENBQUMsVUFBVSxDQUFDO1NBQ2xCLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUU3QixDQUFDLENBQUMsZUFBZSxDQUFDO1NBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWhCLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixFQUFFLENBQUM7SUFDdEMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7U0FDOUIsTUFBTSxDQUFDLFNBQVMsQ0FBQztTQUNqQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFZixDQUFDLENBQUMsU0FBUyxDQUFDO1NBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFqQ0Qsd0RBaUNDIiwiZmlsZSI6ImxpYi51c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvcGx1Z2luLnRzXCIpO1xuIiwiaW1wb3J0IHsgc3RhcnRTZWVrQ2hlY2ssIHN0YXJ0VXJsQ2hhbmdlQ2hlY2sgfSBmcm9tIFwiLi91dGlsL3NjaGVkdWxlXCI7XG5pbXBvcnQgeyBTZXNzaW9uSWQgfSBmcm9tIFwiLi91dGlsL2NvbnN0c1wiO1xuaW1wb3J0IHsgY2hhbmdlUXVlcnlTdHJpbmcgfSBmcm9tIFwiLi91dGlsL3VybFwiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7IGN1Y3U6IGFueTsgfVxufVxuXG5pbnRlcmZhY2UgUGxheWVyT3B0aW9ucyB7XG4gICAgY29ubmVjdGlvbjoge1xuICAgICAgICBwcm90b2NvbDogc3RyaW5nO1xuICAgICAgICBob3N0OiBzdHJpbmc7XG4gICAgICAgIHBvcnQ6IHN0cmluZztcbiAgICB9O1xufVxuXG5lbnVtIE1lc3NhZ2Uge1xuICAgIFBMQVkgPSAncGxheScsXG4gICAgUEFVU0UgPSAncGF1c2UnLFxuICAgIFNFRUsgPSAnc2VlaycsXG4gICAgUExBWV9WSURFTyA9ICdwbGF5LXZpZGVvJ1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXIge1xuICAgIHByaXZhdGUgeXRQbGF5ZXI6IFlULlBsYXllcjtcbiAgICBwdWJsaWMgd3M6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcbiAgICBwcml2YXRlIG9wdGlvbnM6IFBsYXllck9wdGlvbnM7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQbGF5ZXJPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZSh2aWRlb0lkOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgd2luZG93LllULlBsYXllcigneXRkLXBsYXllcicsIHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICB2aWRlb0lkLFxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xuICAgICAgICAgICAgICAgIGNvbG9yOiBcInJlZFwiLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBZVC5BdXRvUGxheS5BdXRvUGxheVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIG9uUmVhZHk6IChlKSA9PiB0aGlzLm9uUmVhZHkoZSwgc2Vzc2lvbklkLCB2aWRlb0lkKSxcbiAgICAgICAgICAgICAgICBvblN0YXRlQ2hhbmdlOiAoZSkgPT4gdGhpcy5vblN0YXRlQ2hhbmdlKGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5jdWN1ID0ge307XG4gICAgICAgIHdpbmRvdy5jdWN1LnBsYXllciA9IHRoaXMueXRQbGF5ZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlYWR5KF86IFlULlBsYXllckV2ZW50LCBzZXNzaW9uSWQ6IHN0cmluZywgdmlkZW9JZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHN0YXJ0U2Vla0NoZWNrKHRoaXMueXRQbGF5ZXIsIDEwMDAsICgpID0+IHRoaXMub25QbGF5ZXJTZWVrKCkpO1xuICAgICAgICBzdGFydFVybENoYW5nZUNoZWNrKDEwMDAsIChvLCBuKSA9PiB0aGlzLm9uVXJsQ2hhbmdlKG8sIG4pKTtcblxuICAgICAgICB0aGlzLmNvbm5lY3RXcyhzZXNzaW9uSWQpO1xuICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5QTEFZX1ZJREVPLCB2aWRlb0lkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RhdGVDaGFuZ2UoZXZlbnQ6IFlULk9uU3RhdGVDaGFuZ2VFdmVudCk6IHZvaWQge1xuICAgICAgICBzd2l0Y2goZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgY2FzZSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUExBWUlORzpcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRXc1RpbWVNZXNzYWdlKE1lc3NhZ2UuUExBWSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHdpbmRvdy5ZVC5QbGF5ZXJTdGF0ZS5QQVVTRUQ6XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kV3NUaW1lTWVzc2FnZShNZXNzYWdlLlBBVVNFKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25QbGF5ZXJTZWVrKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnNlbmRXc1RpbWVNZXNzYWdlKE1lc3NhZ2UuU0VFSyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kV3NUaW1lTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuc2VuZFdzTWVzc2FnZShtZXNzYWdlLCB0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kV3NNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UsIGRhdGE6IHN0cmluZykge1xuICAgICAgICB0aGlzLndzLnNlbmQoYCR7bWVzc2FnZX0gJHtkYXRhfWApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25VcmxDaGFuZ2UobzogTG9jYXRpb24sIG46IExvY2F0aW9uKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVUkwgQ0hBTkdFOiAke28uaHJlZn0gLT4gJHtuLmhyZWZ9YCk7XG4gICAgICAgIGNvbnN0IG9sZFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoby5zZWFyY2gpO1xuICAgICAgICBjb25zdCBuZXdQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKG4uc2VhcmNoKTtcblxuICAgICAgICBjb25zdCBvbGRTZXNzaW9uSWQgPSBvbGRQYXJhbXMuZ2V0KFNlc3Npb25JZCk7XG4gICAgICAgIGNvbnN0IG5ld1Nlc3Npb25JZCA9IG5ld1BhcmFtcy5nZXQoU2Vzc2lvbklkKTtcbiAgICAgICAgaWYob2xkU2Vzc2lvbklkICE9PSBudWxsICYmIG5ld1Nlc3Npb25JZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbmV3UGFyYW1zLnNldChTZXNzaW9uSWQsIG9sZFNlc3Npb25JZCk7XG4gICAgICAgICAgICBjaGFuZ2VRdWVyeVN0cmluZyhuZXdQYXJhbXMudG9TdHJpbmcoKSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZpZGVvSWQgPSBuZXdQYXJhbXMuZ2V0KCd2Jyk7XG4gICAgICAgIGlmKHZpZGVvSWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZFdzTWVzc2FnZShNZXNzYWdlLlBMQVlfVklERU8sIHZpZGVvSWQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYExvYWRpbmcgbmV3IFZJREVPOiAke3ZpZGVvSWR9YCk7XG4gICAgICAgICAgICB0aGlzLnl0UGxheWVyLmxvYWRWaWRlb0J5SWQodmlkZW9JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbm5lY3RXcyhzZXNzaW9uSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCB7IHByb3RvY29sLCBob3N0LCBwb3J0IH0gPSB0aGlzLm9wdGlvbnMuY29ubmVjdGlvbjtcblxuICAgICAgICB0aGlzLndzID0gaW8oYCR7cHJvdG9jb2x9Oi8vJHtob3N0fToke3BvcnR9LyR7c2Vzc2lvbklkfWAsIHtcbiAgICAgICAgICAgIGF1dG9Db25uZWN0OiB0cnVlLFxuICAgICAgICAgICAgcGF0aDogJy9zb2NrZXQuaW8nXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLndzLm9uKCdjb25uZWN0JywgKCkgPT4gdGhpcy5vbldzQ29ubmVjdGVkKCkpO1xuICAgICAgICB0aGlzLndzLm9uKCdtZXNzYWdlJywgKGQ6IHN0cmluZykgPT4gdGhpcy5vbldzTWVzc2FnZShkLCB0aGlzKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldzQ29ubmVjdGVkKCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZFwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN5bmNQbGF5ZXJUaW1lKHZpZGVvVGltZTogbnVtYmVyLCBtYXJnaW46IG51bWJlciA9IDEuMCk6IHZvaWQge1xuICAgICAgICBpZiAoTWF0aC5hYnModmlkZW9UaW1lIC0gdGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKSA+IG1hcmdpbikge1xuICAgICAgICAgICAgdGhpcy55dFBsYXllci5zZWVrVG8odmlkZW9UaW1lLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Xc01lc3NhZ2UobWVzc2FnZTogc3RyaW5nLCBwbGF5ZXI6IFBsYXllcik6IHZvaWQge1xuICAgICAgICBjb25zdCBbY29tbWFuZCwgZGF0YV0gPSBtZXNzYWdlLnNwbGl0KFwiIFwiKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgTWVzc2FnZTogJHttZXNzYWdlfWApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJTdGF0ZSA9IHBsYXllci55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpO1xuXG4gICAgICAgICAgICBzd2l0Y2goY29tbWFuZCkge1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5QTEFZLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQbGF5ZXIgU3RhdGU6ICR7cGxheWVyU3RhdGV9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnN5bmNQbGF5ZXJUaW1lKHBhcnNlRmxvYXQoZGF0YSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHBsYXllclN0YXRlID09PSBZVC5QbGF5ZXJTdGF0ZS5QQVVTRUQpXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIucGxheVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBBVVNFLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5zeW5jUGxheWVyVGltZShwYXJzZUZsb2F0KGRhdGEpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihwbGF5ZXJTdGF0ZSA9PT0gWVQuUGxheWVyU3RhdGUuUExBWUlORylcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5wYXVzZVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlNFRUsudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnNlZWtUbyhwYXJzZUZsb2F0KGRhdGEpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBMQVlfVklERU8udG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLnNldCgndicsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VRdWVyeVN0cmluZyhwYXJhbXMudG9TdHJpbmcoKSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkgeyBjb25zb2xlLmVycm9yKGUpOyB9XG4gICAgfVxuXG59IiwiaW1wb3J0IFBsYXllciBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCB7IGluamVjdFl0UmVuZGVyZWRCdXR0b24sIGNyZWF0ZVBsdXNJY29uLCBjcmVhdGVMZWF2ZUljb24gfSBmcm9tIFwiLi91dGlsL3l0LWh0bWxcIjtcbmltcG9ydCB7IGdlbmVyYXRlU2Vzc2lvbklkIH0gZnJvbSBcIi4vdXRpbC93ZWJzb2NrZXRcIjtcbmltcG9ydCB7IFNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvY29uc3RzXCI7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgIGNvbnN0IHBsYXllciA9IG5ldyBQbGF5ZXIoe1xuICAgICAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgICAgICBwcm90b2NvbDogJ2h0dHAnLFxuICAgICAgICAgICAgaG9zdDogJzEyNy4wLjAuMScsXG4gICAgICAgICAgICBwb3J0OiAnODA4MCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgdmlkZW9JZCA9IHVybFBhcmFtcy5nZXQoJ3YnKTtcbiAgICBjb25zdCBzZXNzaW9uSWQgPSB1cmxQYXJhbXMuZ2V0KFNlc3Npb25JZCk7XG5cbiAgICBpZiAoc2Vzc2lvbklkID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGluamVjdFN5bmNCdXR0b25JbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIpKSB7XG4gICAgICAgICAgICAgICAgaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbihcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiLCBcImNyZWF0ZS1zeW5jLWJ1dHRvblwiLCBcIkNyZWF0ZSBTeW5jXCIsIGNyZWF0ZVBsdXNJY29uKCksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsUGFyYW1zLnNldChTZXNzaW9uSWQsIGdlbmVyYXRlU2Vzc2lvbklkKCkpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uc2VhcmNoID0gdXJsUGFyYW1zLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbmplY3RTeW5jQnV0dG9uSW50ZXJ2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCA1MDApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcGxheWVyLmNyZWF0ZSh2aWRlb0lkLCBzZXNzaW9uSWQpO1xuICAgICAgICBjb25zdCBpbmplY3RMZWF2ZUJ1dHRvbkludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIikpIHtcbiAgICAgICAgICAgICAgICBpbmplY3RZdFJlbmRlcmVkQnV0dG9uKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIsIFwiY3JlYXRlLXN5bmMtYnV0dG9uXCIsIFwiTGVhdmUgU3luY1wiLCBjcmVhdGVMZWF2ZUljb24oKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXMuZGVsZXRlKFNlc3Npb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggPSB1cmxQYXJhbXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGluamVjdExlYXZlQnV0dG9uSW50ZXJ2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCA1MDApO1xuICAgIH1cbn07IiwiZXhwb3J0IGNvbnN0IFNlc3Npb25JZCA9ICdzeW5jSWQnOyIsImV4cG9ydCBjb25zdCBzdGFydFNlZWtDaGVjayA9IChwbGF5ZXI6IFlULlBsYXllciwgaW50ZXJ2YWw6IG51bWJlciwgY2I6ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkID0+IHtcbiAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yOTI5Mzg3Ny9ob3ctdG8tbGlzdGVuLXRvLXNlZWstZXZlbnQtaW4teW91dHViZS1lbWJlZC1hcGlcbiAgICBsZXQgbGFzdFRpbWUgPSAtMTtcblxuICAgIGNvbnN0IGNoZWNrUGxheWVyVGltZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKGxhc3RUaW1lICE9PSAtMSkge1xuICAgICAgICAgICAgaWYocGxheWVyLmdldFBsYXllclN0YXRlKCkgPT09IHdpbmRvdy5ZVC5QbGF5ZXJTdGF0ZS5QTEFZSU5HICkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWUgPSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcblxuICAgICAgICAgICAgICAgIC8vIGV4cGVjdGluZyAxIHNlY29uZCBpbnRlcnZhbCAsIHdpdGggNTAwIG1zIG1hcmdpblxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aW1lIC0gbGFzdFRpbWUgLSAxKSA+IDAuNSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGVyZSB3YXMgYSBzZWVrIG9jY3VyaW5nXG4gICAgICAgICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxhc3RUaW1lID0gcGxheWVyLmdldEN1cnJlbnRUaW1lKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRJbnRlcnZhbChjaGVja1BsYXllclRpbWUsIGludGVydmFsKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgfTtcbn07XG5cblxuZXhwb3J0IGNvbnN0IHN0YXJ0VXJsQ2hhbmdlQ2hlY2sgPSAoaW50ZXJ2YWw6IG51bWJlciwgY2I6IChvOiBMb2NhdGlvbiwgbjogTG9jYXRpb24pID0+IHZvaWQpOiAoKSA9PiB2b2lkID0+IHtcbiAgICBsZXQgb2xkOiBMb2NhdGlvbiA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkod2luZG93LmxvY2F0aW9uKSk7XG4gICAgY29uc3QgY2hlY2tVUkwgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSB3aW5kb3cubG9jYXRpb247XG5cbiAgICAgICAgaWYob2xkID09PSBudWxsKSB7XG4gICAgICAgICAgICBvbGQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGN1cnJlbnQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvbGQuaHJlZiAhPT0gY3VycmVudC5ocmVmKSB7XG4gICAgICAgICAgICBjYihvbGQsIGN1cnJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgb2xkID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjdXJyZW50KSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRJbnRlcnZhbChjaGVja1VSTCwgaW50ZXJ2YWwpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICB9O1xufTsiLCJleHBvcnQgZnVuY3Rpb24gY2hhbmdlUXVlcnlTdHJpbmcoc2VhcmNoU3RyaW5nLCBkb2N1bWVudFRpdGxlKSB7XG4gICAgZG9jdW1lbnRUaXRsZSA9IHR5cGVvZiBkb2N1bWVudFRpdGxlICE9PSAndW5kZWZpbmVkJyA/IGRvY3VtZW50VGl0bGUgOiBkb2N1bWVudC50aXRsZTtcbiAgICBjb25zdCB1cmxTcGxpdCA9ICh3aW5kb3cubG9jYXRpb24uaHJlZikuc3BsaXQoXCI/XCIpO1xuICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgVGl0bGU6IGRvY3VtZW50VGl0bGUsXG4gICAgICAgIFVybDogdXJsU3BsaXRbMF0gKyAnPycgKyBzZWFyY2hTdHJpbmdcbiAgICB9O1xuXG4gICAgaGlzdG9yeS5wdXNoU3RhdGUob2JqLCBvYmouVGl0bGUsIG9iai5VcmwpO1xufSIsImV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVNlc3Npb25JZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KTtcbn0iLCJleHBvcnQgZnVuY3Rpb24gY3JlYXRlUGx1c0ljb24oKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8c3ZnXG4gICAgICAgICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgICAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW89XCJ4TWlkWU1pZCBtZWV0XCJcbiAgICAgICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgICAgIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiXG4gICAgICAgICAgICBzdHlsZT1cInBvaW50ZXItZXZlbnRzOiBub25lOyBkaXNwbGF5OiBibG9jazsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTtcIlxuICAgICAgICA+XG4gICAgICAgICAgICA8ZyBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIj5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTE5IDEzaC02djZoLTJ2LTZINXYtMmg2VjVoMnY2aDZ2MnpcIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIiAvPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICA8L3N2Zz5cbiAgICBgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxlYXZlSWNvbigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDxzdmdcbiAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgICAgcHJlc2VydmVBc3BlY3RSYXRpbz1cInhNaWRZTWlkIG1lZXRcIlxuICAgICAgICAgICAgZm9jdXNhYmxlPVwiZmFsc2VcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCJcbiAgICAgICAgICAgIHN0eWxlPVwicG9pbnRlci1ldmVudHM6IG5vbmU7IGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlO1wiXG4gICAgICAgID5cbiAgICAgICAgICAgIDxnIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTAuMDkgMTUuNTlMMTEuNSAxN2w1LTUtNS01LTEuNDEgMS40MUwxMi42NyAxMUgzdjJoOS42N2wtMi41OCAyLjU5ek0xOSAzSDVjLTEuMTEgMC0yIC45LTIgMnY0aDJWNWgxNHYxNEg1di00SDN2NGMwIDEuMS44OSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY1YzAtMS4xLS45LTItMi0yelwiIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiIC8+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgIDwvc3ZnPlxuICAgIGApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEljb25TaGVsbCgpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWljb24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIgLz5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uQnV0dG9uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uLWJ1dHRvbiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiBpZD1cImJ1dHRvblwiPmApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEZvcm1hdHRlZFN0cmluZyhjYjogKCkgPT4gdm9pZCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtZm9ybWF0dGVkLXN0cmluZyBpZD1cInRleHRcIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiAvPmApXG4gICAgICAgIC5jbGljayhjYik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0UmVuZGVyZWRCdXR0b25Db250YWluZXIoaWQ6IHN0cmluZyk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1idXR0b24tcmVuZGVyZXIgaWQ9XCIke2lkfVwiIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLW1lbnUtcmVuZGVyZXIgZm9yY2UtaWNvbi1idXR0b24gc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiBidXR0b24tcmVuZGVyZXI9XCJcIiB1c2Uta2V5Ym9hcmQtZm9jdXNlZD1cIlwiIGlzLWljb24tYnV0dG9uPVwiXCIgLz5cbiAgICBgKTtcbn1cblxuLyoqXG4gKiBJbmplY3QgYSBZdFJlbmRlcmVkQnV0dG9uIGludG8gYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIG9iaklkIFRoZSBJZCBvZiB0aGUgb2JqZWN0IHRoZSBZdFJlbmRlcmVkQnV0dG9uIHNob3VsZCBiZSBpbmplY3RlZCB0b1xuICogQHBhcmFtIHRleHQgVGhlIHRleHQgb2YgdGhlIGJ1dHRvblxuICogQHBhcmFtIGljb24gVGhlIGljb24gb2YgdGhlIGJ1dHRvbiAobmVlZHMgdG8gYmUgYSBzdmcgRWxlbWVudClcbiAqIEBwYXJhbSBjYiBUaGUgZnVuY3Rpb24gdGhhdCBzaG91bGQgYmUgY2FsbGVkIG9uIGJ1dHRvbiBjbGlja1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbihvYmpJZDogc3RyaW5nLCBjb250YWluZXJJZDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcsIGljb246IEpRdWVyeTxIVE1MRWxlbWVudD4sIGNiOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgLy8gVGhlIGNvbXBsZXRlIGJ1dHRvbiBuZWVkcyB0byBiZSBpbmplY3RlZCBleGFjdGx5IGxpa2UgdGhpc1xuICAgIC8vIGJlY2F1c2Ugd2hlbiB3ZSBpbmplY3QgdGhlIGNvbXBsZXRlbHkgYnVpbGQgYnV0dG9uXG4gICAgLy8gWVQgcmVtb3ZlcyBhbGwgaXRzIGNvbnRlbnQgc28gd2UgbmVlZCB0byBwYXJ0aWFsbHkgaW5qZWN0XG4gICAgLy8gZXZlcnl0aGluZyBpbiBvcmRlciB0byBnZXQgaXQgdG8gd29ya1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGNyZWF0ZVl0UmVuZGVyZWRCdXR0b25Db250YWluZXIoY29udGFpbmVySWQpO1xuICAgICQob2JqSWQpXG4gICAgICAgIC5hcHBlbmQoY29udGFpbmVyKTtcblxuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAkKGEpXG4gICAgICAgIC5hZGRDbGFzcyhcInl0LXNpbXBsZS1lbmRwb2ludCBzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIpXG4gICAgICAgIC5hdHRyKFwidGFiaW5kZXhcIiwgLTEpO1xuXG4gICAgJChjb250YWluZXIpXG4gICAgICAgIC5hcHBlbmQoYSk7XG5cbiAgICBjb25zdCBpY29uQnV0dG9uID0gY3JlYXRlWXRJY29uQnV0dG9uU2hlbGwoKTtcbiAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBjcmVhdGVZdEZvcm1hdHRlZFN0cmluZyhjYik7XG4gICAgJChhKVxuICAgICAgICAuYXBwZW5kKGljb25CdXR0b24pXG4gICAgICAgIC5hcHBlbmQoZm9ybWF0dGVkU3RyaW5nKTtcblxuICAgICQoZm9ybWF0dGVkU3RyaW5nKVxuICAgICAgICAudGV4dCh0ZXh0KTtcblxuICAgIGNvbnN0IGljb25TaGVsbCA9IGNyZWF0ZVl0SWNvblNoZWxsKCk7XG4gICAgJChpY29uQnV0dG9uKS5maW5kKFwiYnV0dG9uI2J1dHRvblwiKVxuICAgICAgICAuYXBwZW5kKGljb25TaGVsbClcbiAgICAgICAgLmNsaWNrKGNiKTtcblxuICAgICQoaWNvblNoZWxsKVxuICAgICAgICAuYXBwZW5kKGljb24pO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==