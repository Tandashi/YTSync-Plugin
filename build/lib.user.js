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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = __importDefault(__webpack_require__(/*! ./player */ "./src/player.ts"));
const ytHTML = __importStar(__webpack_require__(/*! ./util/yt-html */ "./src/util/yt-html.ts"));
const websocket_1 = __webpack_require__(/*! ./util/websocket */ "./src/util/websocket.ts");
const consts_1 = __webpack_require__(/*! ./util/consts */ "./src/util/consts.ts");
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const intervals = {
        syncButton: null,
        leaveButton: null,
        removeUpnext: null,
        queue: null
    };
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
        intervals.syncButton = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                ytHTML.injectYtRenderedButton($("div#info ytd-menu-renderer div#top-level-buttons"), "create-sync-button", "Create Sync", ytHTML.createPlusIcon(), () => {
                    urlParams.set(consts_1.SessionId, websocket_1.generateSessionId());
                    window.location.search = urlParams.toString();
                });
                clearInterval(intervals.syncButton);
            }
        }, 500);
    }
    else {
        player.create(videoId, sessionId);
        intervals.leaveButton = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                ytHTML.injectYtRenderedButton($("div#info ytd-menu-renderer div#top-level-buttons"), "create-sync-button", "Leave Sync", ytHTML.createLeaveIcon(), () => {
                    urlParams.delete(consts_1.SessionId);
                    window.location.search = urlParams.toString();
                });
                clearInterval(intervals.leaveButton);
            }
        }, 500);
    }
    intervals.removeUpnext = setInterval(() => {
        if ($("ytd-compact-autoplay-renderer.ytd-watch-next-secondary-results-renderer")) {
            ytHTML.removeUpnext();
            clearInterval(intervals.removeUpnext);
        }
    }, 500);
    intervals.queue = setInterval(() => {
        if ($("div#secondary #playlist")) {
            const renderer = ytHTML.injectEmptyQueueShell("Queue", false, true);
            const items = renderer.find('#items');
            ytHTML.injectVideoQueueElement(items, '8ZOghmnklC0', 'Video Title', 'ByLine', () => console.log("CLICK"), () => console.log("DELETE"));
            ytHTML.injectVideoQueueElement(items, '8ZOghmnklC0', 'Video Title 2', 'ByLine2', () => console.log("CLICK"), () => console.log("DELETE"));
            clearInterval(intervals.queue);
        }
    }, 500);
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
function createSvg(d) {
    return $(`
        <svg
            viewBox="0 0 24 24"
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
            class="style-scope yt-icon"
            style="pointer-events: none; display: block; width: 100%; height: 100%;"
        >
            <g class="style-scope yt-icon">
                <path d="${d}" class="style-scope yt-icon" />
            </g>
        </svg>
    `);
}
function createPlusIcon() {
    return createSvg("M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z");
}
exports.createPlusIcon = createPlusIcon;
function createLeaveIcon() {
    return createSvg("M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z");
}
exports.createLeaveIcon = createLeaveIcon;
function createTrashIcon() {
    return createSvg("M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z");
}
exports.createTrashIcon = createTrashIcon;
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
function createYtSimpleEndpoint() {
    return $(`
        <a class="yt-simple-endpoint style-scope ytd-button-renderer" tabindex="-1">
    `);
}
function createYtIconButtonRenderer(id, hasText) {
    return $(`
        <ytd-button-renderer
            id="${id}"
            class="style-scope ytd-menu-renderer force-icon-button style-default size-default"
            button-renderer=""
            use-keyboard-focused=""
            is-icon-button=""
            ${!hasText ? "has-no-text" : ""}
        />
    `);
}
function createYtMenuRenderer() {
    return $(`
        <ytd-menu-renderer class="style-scope ytd-playlist-panel-video-renderer">
    `);
}
function createYtPlaylistPanelVideoRenderer() {
    return $(`
        <ytd-playlist-panel-video-renderer
            id="playlist-items"
            class="style-scope ytd-playlist-panel-renderer"
            lockup=""
            watch-color-update_=""
            can-reorder=""
            touch-persistent-drag-handle=""
        />
    `);
}
function createYtPlaylistPanelRenderer() {
    return $(`
        <ytd-playlist-panel-renderer
            id="playlist"
            class="style-scope ytd-watch-flexy"
            js-panel-height_=""
            has-playlist-buttons=""
            has-toolbar_=""
            playlist-type_="TLPQ",
            collapsible=""
            collapsed=""
        />
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
    const hasText = text !== "" && text !== null;
    const container = createYtIconButtonRenderer(containerId, hasText);
    $(objId)
        .append(container);
    const a = createYtSimpleEndpoint();
    $(container)
        .append(a);
    const iconButton = createYtIconButtonShell();
    const formattedString = hasText ? createYtFormattedString(cb) : null;
    $(a)
        .append(iconButton)
        .append(formattedString);
    if (hasText) {
        $(formattedString)
            .text(text);
    }
    const iconShell = createYtIconShell();
    $(iconButton).find("button#button")
        .append(iconShell)
        .click(cb);
    $(iconShell)
        .append(icon);
}
exports.injectYtRenderedButton = injectYtRenderedButton;
function removeUpnext() {
    $('ytd-compact-autoplay-renderer.ytd-watch-next-secondary-results-renderer').remove();
}
exports.removeUpnext = removeUpnext;
function injectVideoQueueElement(obj, videoId, title, byline, ccb, dcb) {
    const playlistVideoRenderer = createYtPlaylistPanelVideoRenderer();
    $(obj)
        .append(playlistVideoRenderer);
    const menuRenderer = createYtMenuRenderer();
    $(playlistVideoRenderer).find('div#menu')
        .append(menuRenderer);
    $(menuRenderer).find('yt-icon-button#button')
        .attr('hidden', '');
    injectYtRenderedButton($(menuRenderer).find('div#top-level-buttons'), "", null, createTrashIcon(), dcb);
    $(playlistVideoRenderer).find('a#thumbnail > yt-img-shadow')
        .css('background-color', 'transparent')
        .removeClass('empty');
    setTimeout(() => {
        $(playlistVideoRenderer).find('img#img')
            .attr('src', `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
        $(playlistVideoRenderer).find('a#thumbnail > yt-img-shadow')
            .attr('loaded');
    }, 500);
    $(playlistVideoRenderer).find('a#wc-endpoint')
        .click(ccb);
    $(playlistVideoRenderer).find('a#thumbnail')
        .click(ccb);
    $(playlistVideoRenderer).find('span#video-title')
        .text(title);
    $(playlistVideoRenderer).find('span#byline')
        .text(byline);
    return playlistVideoRenderer;
}
exports.injectVideoQueueElement = injectVideoQueueElement;
function injectEmptyQueueShell(title, collapsible, collapsed) {
    const renderer = createYtPlaylistPanelRenderer();
    $('div#secondary #playlist')
        .replaceWith(renderer);
    if (!collapsible) {
        $(renderer)
            .removeAttr('collapsible')
            .removeAttr('collapsed');
    }
    else {
        if (!collapsed) {
            $(renderer)
                .removeAttr('collapsed');
        }
    }
    $('div#secondary #playlist h3 yt-formatted-string')
        .text(title);
    return renderer;
}
exports.injectEmptyQueueShell = injectEmptyQueueShell;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL2NvbnN0cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zY2hlZHVsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvd2Vic29ja2V0LnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3l0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2xGQSx3RkFBc0U7QUFDdEUsa0ZBQTBDO0FBQzFDLHlFQUErQztBQWMvQyxJQUFLLE9BS0o7QUFMRCxXQUFLLE9BQU87SUFDUix3QkFBYTtJ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QU8scUJBQXFCLENBQUM7QUFDakMsQ0FBQztBQXZDRCwwREF1Q0M7QUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxLQUFhLEVBQUUsV0FBb0IsRUFBRSxTQUFrQjtJQUN6RixNQUFNLFFBQVEsR0FBRyw2QkFBNkIsRUFBRSxDQUFDO0lBQ2pELENBQUMsQ0FBQyx5QkFBeUIsQ0FBQztTQUN2QixXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFM0IsSUFBRyxDQUFDLFdBQVcsRUFBRTtRQUNiLENBQUMsQ0FBQyxRQUFRLENBQUM7YUFDTixVQUFVLENBQUMsYUFBYSxDQUFDO2FBQ3pCLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUNoQztTQUNJO1FBQ0QsSUFBRyxDQUFDLFNBQVMsRUFBRTtZQUNYLENBQUMsQ0FBQyxRQUFRLENBQUM7aUJBQ04sVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ2hDO0tBQ0o7SUFFRCxDQUFDLENBQUMsZ0RBQWdELENBQUM7U0FDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpCLE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFyQkQsc0RBcUJDIiwiZmlsZSI6ImxpYi51c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvcGx1Z2luLnRzXCIpO1xuIiwiaW1wb3J0IHsgc3RhcnRTZWVrQ2hlY2ssIHN0YXJ0VXJsQ2hhbmdlQ2hlY2sgfSBmcm9tIFwiLi91dGlsL3NjaGVkdWxlXCI7XG5pbXBvcnQgeyBTZXNzaW9uSWQgfSBmcm9tIFwiLi91dGlsL2NvbnN0c1wiO1xuaW1wb3J0IHsgY2hhbmdlUXVlcnlTdHJpbmcgfSBmcm9tIFwiLi91dGlsL3VybFwiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7IGN1Y3U6IGFueTsgfVxufVxuXG5pbnRlcmZhY2UgUGxheWVyT3B0aW9ucyB7XG4gICAgY29ubmVjdGlvbjoge1xuICAgICAgICBwcm90b2NvbDogc3RyaW5nO1xuICAgICAgICBob3N0OiBzdHJpbmc7XG4gICAgICAgIHBvcnQ6IHN0cmluZztcbiAgICB9O1xufVxuXG5lbnVtIE1lc3NhZ2Uge1xuICAgIFBMQVkgPSAncGxheScsXG4gICAgUEFVU0UgPSAncGF1c2UnLFxuICAgIFNFRUsgPSAnc2VlaycsXG4gICAgUExBWV9WSURFTyA9ICdwbGF5LXZpZGVvJ1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXIge1xuICAgIHByaXZhdGUgeXRQbGF5ZXI6IFlULlBsYXllcjtcbiAgICBwdWJsaWMgd3M6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcbiAgICBwcml2YXRlIG9wdGlvbnM6IFBsYXllck9wdGlvbnM7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQbGF5ZXJPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZSh2aWRlb0lkOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgd2luZG93LllULlBsYXllcigneXRkLXBsYXllcicsIHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICB2aWRlb0lkLFxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xuICAgICAgICAgICAgICAgIGNvbG9yOiBcInJlZFwiLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBZVC5BdXRvUGxheS5BdXRvUGxheVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIG9uUmVhZHk6IChlKSA9PiB0aGlzLm9uUmVhZHkoZSwgc2Vzc2lvbklkLCB2aWRlb0lkKSxcbiAgICAgICAgICAgICAgICBvblN0YXRlQ2hhbmdlOiAoZSkgPT4gdGhpcy5vblN0YXRlQ2hhbmdlKGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5jdWN1ID0ge307XG4gICAgICAgIHdpbmRvdy5jdWN1LnBsYXllciA9IHRoaXMueXRQbGF5ZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlYWR5KF86IFlULlBsYXllckV2ZW50LCBzZXNzaW9uSWQ6IHN0cmluZywgdmlkZW9JZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHN0YXJ0U2Vla0NoZWNrKHRoaXMueXRQbGF5ZXIsIDEwMDAsICgpID0+IHRoaXMub25QbGF5ZXJTZWVrKCkpO1xuICAgICAgICBzdGFydFVybENoYW5nZUNoZWNrKDEwMDAsIChvLCBuKSA9PiB0aGlzLm9uVXJsQ2hhbmdlKG8sIG4pKTtcblxuICAgICAgICB0aGlzLmNvbm5lY3RXcyhzZXNzaW9uSWQpO1xuICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5QTEFZX1ZJREVPLCB2aWRlb0lkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RhdGVDaGFuZ2UoZXZlbnQ6IFlULk9uU3RhdGVDaGFuZ2VFdmVudCk6IHZvaWQge1xuICAgICAgICBzd2l0Y2goZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgY2FzZSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUExBWUlORzpcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRXc1RpbWVNZXNzYWdlKE1lc3NhZ2UuUExBWSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHdpbmRvdy5ZVC5QbGF5ZXJTdGF0ZS5QQVVTRUQ6XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kV3NUaW1lTWVzc2FnZShNZXNzYWdlLlBBVVNFKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25QbGF5ZXJTZWVrKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnNlbmRXc1RpbWVNZXNzYWdlKE1lc3NhZ2UuU0VFSyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kV3NUaW1lTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuc2VuZFdzTWVzc2FnZShtZXNzYWdlLCB0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kV3NNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UsIGRhdGE6IHN0cmluZykge1xuICAgICAgICB0aGlzLndzLnNlbmQoYCR7bWVzc2FnZX0gJHtkYXRhfWApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25VcmxDaGFuZ2UobzogTG9jYXRpb24sIG46IExvY2F0aW9uKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVUkwgQ0hBTkdFOiAke28uaHJlZn0gLT4gJHtuLmhyZWZ9YCk7XG4gICAgICAgIGNvbnN0IG9sZFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoby5zZWFyY2gpO1xuICAgICAgICBjb25zdCBuZXdQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKG4uc2VhcmNoKTtcblxuICAgICAgICBjb25zdCBvbGRTZXNzaW9uSWQgPSBvbGRQYXJhbXMuZ2V0KFNlc3Npb25JZCk7XG4gICAgICAgIGNvbnN0IG5ld1Nlc3Npb25JZCA9IG5ld1BhcmFtcy5nZXQoU2Vzc2lvbklkKTtcbiAgICAgICAgaWYob2xkU2Vzc2lvbklkICE9PSBudWxsICYmIG5ld1Nlc3Npb25JZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbmV3UGFyYW1zLnNldChTZXNzaW9uSWQsIG9sZFNlc3Npb25JZCk7XG4gICAgICAgICAgICBjaGFuZ2VRdWVyeVN0cmluZyhuZXdQYXJhbXMudG9TdHJpbmcoKSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZpZGVvSWQgPSBuZXdQYXJhbXMuZ2V0KCd2Jyk7XG4gICAgICAgIGlmKHZpZGVvSWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZFdzTWVzc2FnZShNZXNzYWdlLlBMQVlfVklERU8sIHZpZGVvSWQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYExvYWRpbmcgbmV3IFZJREVPOiAke3ZpZGVvSWR9YCk7XG4gICAgICAgICAgICB0aGlzLnl0UGxheWVyLmxvYWRWaWRlb0J5SWQodmlkZW9JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbm5lY3RXcyhzZXNzaW9uSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCB7IHByb3RvY29sLCBob3N0LCBwb3J0IH0gPSB0aGlzLm9wdGlvbnMuY29ubmVjdGlvbjtcblxuICAgICAgICB0aGlzLndzID0gaW8oYCR7cHJvdG9jb2x9Oi8vJHtob3N0fToke3BvcnR9LyR7c2Vzc2lvbklkfWAsIHtcbiAgICAgICAgICAgIGF1dG9Db25uZWN0OiB0cnVlLFxuICAgICAgICAgICAgcGF0aDogJy9zb2NrZXQuaW8nXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLndzLm9uKCdjb25uZWN0JywgKCkgPT4gdGhpcy5vbldzQ29ubmVjdGVkKCkpO1xuICAgICAgICB0aGlzLndzLm9uKCdtZXNzYWdlJywgKGQ6IHN0cmluZykgPT4gdGhpcy5vbldzTWVzc2FnZShkLCB0aGlzKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldzQ29ubmVjdGVkKCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZFwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN5bmNQbGF5ZXJUaW1lKHZpZGVvVGltZTogbnVtYmVyLCBtYXJnaW46IG51bWJlciA9IDEuMCk6IHZvaWQge1xuICAgICAgICBpZiAoTWF0aC5hYnModmlkZW9UaW1lIC0gdGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKSA+IG1hcmdpbikge1xuICAgICAgICAgICAgdGhpcy55dFBsYXllci5zZWVrVG8odmlkZW9UaW1lLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Xc01lc3NhZ2UobWVzc2FnZTogc3RyaW5nLCBwbGF5ZXI6IFBsYXllcik6IHZvaWQge1xuICAgICAgICBjb25zdCBbY29tbWFuZCwgZGF0YV0gPSBtZXNzYWdlLnNwbGl0KFwiIFwiKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgTWVzc2FnZTogJHttZXNzYWdlfWApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJTdGF0ZSA9IHBsYXllci55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpO1xuXG4gICAgICAgICAgICBzd2l0Y2goY29tbWFuZCkge1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5QTEFZLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQbGF5ZXIgU3RhdGU6ICR7cGxheWVyU3RhdGV9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnN5bmNQbGF5ZXJUaW1lKHBhcnNlRmxvYXQoZGF0YSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHBsYXllclN0YXRlID09PSBZVC5QbGF5ZXJTdGF0ZS5QQVVTRUQpXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIucGxheVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBBVVNFLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5zeW5jUGxheWVyVGltZShwYXJzZUZsb2F0KGRhdGEpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihwbGF5ZXJTdGF0ZSA9PT0gWVQuUGxheWVyU3RhdGUuUExBWUlORylcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5wYXVzZVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlNFRUsudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnNlZWtUbyhwYXJzZUZsb2F0KGRhdGEpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBMQVlfVklERU8udG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLnNldCgndicsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VRdWVyeVN0cmluZyhwYXJhbXMudG9TdHJpbmcoKSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkgeyBjb25zb2xlLmVycm9yKGUpOyB9XG4gICAgfVxuXG59IiwiaW1wb3J0IFBsYXllciBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCAqIGFzIHl0SFRNTCBmcm9tIFwiLi91dGlsL3l0LWh0bWxcIjtcbmltcG9ydCB7IGdlbmVyYXRlU2Vzc2lvbklkIH0gZnJvbSBcIi4vdXRpbC93ZWJzb2NrZXRcIjtcbmltcG9ydCB7IFNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvY29uc3RzXCI7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgIGNvbnN0IGludGVydmFscyA9IHtcbiAgICAgICAgc3luY0J1dHRvbjogbnVsbCxcbiAgICAgICAgbGVhdmVCdXR0b246IG51bGwsXG4gICAgICAgIHJlbW92ZVVwbmV4dDogbnVsbCxcbiAgICAgICAgcXVldWU6IG51bGxcbiAgICB9O1xuXG4gICAgY29uc3QgcGxheWVyID0gbmV3IFBsYXllcih7XG4gICAgICAgIGNvbm5lY3Rpb246IHtcbiAgICAgICAgICAgIHByb3RvY29sOiAnaHR0cCcsXG4gICAgICAgICAgICBob3N0OiAnMTI3LjAuMC4xJyxcbiAgICAgICAgICAgIHBvcnQ6ICc4MDgwJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCB2aWRlb0lkID0gdXJsUGFyYW1zLmdldCgndicpO1xuICAgIGNvbnN0IHNlc3Npb25JZCA9IHVybFBhcmFtcy5nZXQoU2Vzc2lvbklkKTtcblxuICAgIGlmIChzZXNzaW9uSWQgPT09IG51bGwpIHtcbiAgICAgICAgaW50ZXJ2YWxzLnN5bmNCdXR0b24gPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSkge1xuICAgICAgICAgICAgICAgIHl0SFRNTC5pbmplY3RZdFJlbmRlcmVkQnV0dG9uKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIiksIFwiY3JlYXRlLXN5bmMtYnV0dG9uXCIsIFwiQ3JlYXRlIFN5bmNcIiwgeXRIVE1MLmNyZWF0ZVBsdXNJY29uKCksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsUGFyYW1zLnNldChTZXNzaW9uSWQsIGdlbmVyYXRlU2Vzc2lvbklkKCkpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uc2VhcmNoID0gdXJsUGFyYW1zLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbHMuc3luY0J1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBwbGF5ZXIuY3JlYXRlKHZpZGVvSWQsIHNlc3Npb25JZCk7XG4gICAgICAgIGludGVydmFscy5sZWF2ZUJ1dHRvbiA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIpKSB7XG4gICAgICAgICAgICAgICAgeXRIVE1MLmluamVjdFl0UmVuZGVyZWRCdXR0b24oJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSwgXCJjcmVhdGUtc3luYy1idXR0b25cIiwgXCJMZWF2ZSBTeW5jXCIsIHl0SFRNTC5jcmVhdGVMZWF2ZUljb24oKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXMuZGVsZXRlKFNlc3Npb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggPSB1cmxQYXJhbXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5sZWF2ZUJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxuXG4gICAgaW50ZXJ2YWxzLnJlbW92ZVVwbmV4dCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKCQoXCJ5dGQtY29tcGFjdC1hdXRvcGxheS1yZW5kZXJlci55dGQtd2F0Y2gtbmV4dC1zZWNvbmRhcnktcmVzdWx0cy1yZW5kZXJlclwiKSkge1xuICAgICAgICAgICAgeXRIVE1MLnJlbW92ZVVwbmV4dCgpO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbHMucmVtb3ZlVXBuZXh0KTtcbiAgICAgICAgfVxuICAgIH0sIDUwMCk7XG5cbiAgICBpbnRlcnZhbHMucXVldWUgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmICgkKFwiZGl2I3NlY29uZGFyeSAjcGxheWxpc3RcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbmRlcmVyID0geXRIVE1MLmluamVjdEVtcHR5UXVldWVTaGVsbChcIlF1ZXVlXCIsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gcmVuZGVyZXIuZmluZCgnI2l0ZW1zJyk7XG4gICAgICAgICAgICB5dEhUTUwuaW5qZWN0VmlkZW9RdWV1ZUVsZW1lbnQoaXRlbXMsICc4Wk9naG1ua2xDMCcsICdWaWRlbyBUaXRsZScsICdCeUxpbmUnLCAoKSA9PiBjb25zb2xlLmxvZyhcIkNMSUNLXCIpLCAoKSA9PiBjb25zb2xlLmxvZyhcIkRFTEVURVwiKSk7XG4gICAgICAgICAgICB5dEhUTUwuaW5qZWN0VmlkZW9RdWV1ZUVsZW1lbnQoaXRlbXMsICc4Wk9naG1ua2xDMCcsICdWaWRlbyBUaXRsZSAyJywgJ0J5TGluZTInLCAoKSA9PiBjb25zb2xlLmxvZyhcIkNMSUNLXCIpLCAoKSA9PiBjb25zb2xlLmxvZyhcIkRFTEVURVwiKSk7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5xdWV1ZSk7XG4gICAgICAgIH1cbiAgICB9LCA1MDApO1xuXG59OyIsImV4cG9ydCBjb25zdCBTZXNzaW9uSWQgPSAnc3luY0lkJzsiLCJleHBvcnQgY29uc3Qgc3RhcnRTZWVrQ2hlY2sgPSAocGxheWVyOiBZVC5QbGF5ZXIsIGludGVydmFsOiBudW1iZXIsIGNiOiAoKSA9PiB2b2lkKTogKCkgPT4gdm9pZCA9PiB7XG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjkyOTM4NzcvaG93LXRvLWxpc3Rlbi10by1zZWVrLWV2ZW50LWluLXlvdXR1YmUtZW1iZWQtYXBpXG4gICAgbGV0IGxhc3RUaW1lID0gLTE7XG5cbiAgICBjb25zdCBjaGVja1BsYXllclRpbWUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChsYXN0VGltZSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGlmKHBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpID09PSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUExBWUlORyApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lID0gcGxheWVyLmdldEN1cnJlbnRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBleHBlY3RpbmcgMSBzZWNvbmQgaW50ZXJ2YWwgLCB3aXRoIDUwMCBtcyBtYXJnaW5cbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnModGltZSAtIGxhc3RUaW1lIC0gMSkgPiAwLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlcmUgd2FzIGEgc2VlayBvY2N1cmluZ1xuICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsYXN0VGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVyID0gc2V0SW50ZXJ2YWwoY2hlY2tQbGF5ZXJUaW1lLCBpbnRlcnZhbCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgIH07XG59O1xuXG5cbmV4cG9ydCBjb25zdCBzdGFydFVybENoYW5nZUNoZWNrID0gKGludGVydmFsOiBudW1iZXIsIGNiOiAobzogTG9jYXRpb24sIG46IExvY2F0aW9uKSA9PiB2b2lkKTogKCkgPT4gdm9pZCA9PiB7XG4gICAgbGV0IG9sZDogTG9jYXRpb24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHdpbmRvdy5sb2NhdGlvbikpO1xuICAgIGNvbnN0IGNoZWNrVVJMID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gd2luZG93LmxvY2F0aW9uO1xuXG4gICAgICAgIGlmKG9sZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgb2xkID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjdXJyZW50KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2xkLmhyZWYgIT09IGN1cnJlbnQuaHJlZikge1xuICAgICAgICAgICAgY2Iob2xkLCBjdXJyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9sZCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY3VycmVudCkpO1xuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVyID0gc2V0SW50ZXJ2YWwoY2hlY2tVUkwsIGludGVydmFsKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgfTtcbn07IiwiZXhwb3J0IGZ1bmN0aW9uIGNoYW5nZVF1ZXJ5U3RyaW5nKHNlYXJjaFN0cmluZywgZG9jdW1lbnRUaXRsZSkge1xuICAgIGRvY3VtZW50VGl0bGUgPSB0eXBlb2YgZG9jdW1lbnRUaXRsZSAhPT0gJ3VuZGVmaW5lZCcgPyBkb2N1bWVudFRpdGxlIDogZG9jdW1lbnQudGl0bGU7XG4gICAgY29uc3QgdXJsU3BsaXQgPSAod2luZG93LmxvY2F0aW9uLmhyZWYpLnNwbGl0KFwiP1wiKTtcbiAgICBjb25zdCBvYmogPSB7XG4gICAgICAgIFRpdGxlOiBkb2N1bWVudFRpdGxlLFxuICAgICAgICBVcmw6IHVybFNwbGl0WzBdICsgJz8nICsgc2VhcmNoU3RyaW5nXG4gICAgfTtcblxuICAgIGhpc3RvcnkucHVzaFN0YXRlKG9iaiwgb2JqLlRpdGxlLCBvYmouVXJsKTtcbn0iLCJleHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSk7XG59IiwiZnVuY3Rpb24gY3JlYXRlU3ZnKGQ6IHN0cmluZyk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHN2Z1xuICAgICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pZFlNaWQgbWVldFwiXG4gICAgICAgICAgICBmb2N1c2FibGU9XCJmYWxzZVwiXG4gICAgICAgICAgICBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIlxuICAgICAgICAgICAgc3R5bGU9XCJwb2ludGVyLWV2ZW50czogbm9uZTsgZGlzcGxheTogYmxvY2s7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7XCJcbiAgICAgICAgPlxuICAgICAgICAgICAgPGcgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD1cIiR7ZH1cIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIiAvPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICA8L3N2Zz5cbiAgICBgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBsdXNJY29uKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiBjcmVhdGVTdmcoXCJNMTkgMTNoLTZ2NmgtMnYtNkg1di0yaDZWNWgydjZoNnYyelwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxlYXZlSWNvbigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gY3JlYXRlU3ZnKFwiTTEwLjA5IDE1LjU5TDExLjUgMTdsNS01LTUtNS0xLjQxIDEuNDFMMTIuNjcgMTFIM3YyaDkuNjdsLTIuNTggMi41OXpNMTkgM0g1Yy0xLjExIDAtMiAuOS0yIDJ2NGgyVjVoMTR2MTRINXYtNEgzdjRjMCAxLjEuODkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMS0uOS0yLTItMnpcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFzaEljb24oKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuIGNyZWF0ZVN2ZyhcIk02IDE5YzAgMS4xLjkgMiAyIDJoOGMxLjEgMCAyLS45IDItMlY3SDZ2MTJ6TTE5IDRoLTMuNWwtMS0xaC01bC0xIDFINXYyaDE0VjR6XCIpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEljb25TaGVsbCgpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWljb24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIgLz5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uQnV0dG9uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uLWJ1dHRvbiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiBpZD1cImJ1dHRvblwiPmApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEZvcm1hdHRlZFN0cmluZyhjYjogKCkgPT4gdm9pZCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtZm9ybWF0dGVkLXN0cmluZyBpZD1cInRleHRcIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiAvPmApXG4gICAgICAgIC5jbGljayhjYik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0U2ltcGxlRW5kcG9pbnQoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8YSBjbGFzcz1cInl0LXNpbXBsZS1lbmRwb2ludCBzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIgdGFiaW5kZXg9XCItMVwiPlxuICAgIGApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEljb25CdXR0b25SZW5kZXJlcihpZDogc3RyaW5nLCBoYXNUZXh0OiBib29sZWFuKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8eXRkLWJ1dHRvbi1yZW5kZXJlclxuICAgICAgICAgICAgaWQ9XCIke2lkfVwiXG4gICAgICAgICAgICBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1tZW51LXJlbmRlcmVyIGZvcmNlLWljb24tYnV0dG9uIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCJcbiAgICAgICAgICAgIGJ1dHRvbi1yZW5kZXJlcj1cIlwiXG4gICAgICAgICAgICB1c2Uta2V5Ym9hcmQtZm9jdXNlZD1cIlwiXG4gICAgICAgICAgICBpcy1pY29uLWJ1dHRvbj1cIlwiXG4gICAgICAgICAgICAkeyFoYXNUZXh0ID8gXCJoYXMtbm8tdGV4dFwiIDogXCJcIn1cbiAgICAgICAgLz5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRNZW51UmVuZGVyZXIoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8eXRkLW1lbnUtcmVuZGVyZXIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtcGxheWxpc3QtcGFuZWwtdmlkZW8tcmVuZGVyZXJcIj5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRQbGF5bGlzdFBhbmVsVmlkZW9SZW5kZXJlcigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDx5dGQtcGxheWxpc3QtcGFuZWwtdmlkZW8tcmVuZGVyZXJcbiAgICAgICAgICAgIGlkPVwicGxheWxpc3QtaXRlbXNcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtcGxheWxpc3QtcGFuZWwtcmVuZGVyZXJcIlxuICAgICAgICAgICAgbG9ja3VwPVwiXCJcbiAgICAgICAgICAgIHdhdGNoLWNvbG9yLXVwZGF0ZV89XCJcIlxuICAgICAgICAgICAgY2FuLXJlb3JkZXI9XCJcIlxuICAgICAgICAgICAgdG91Y2gtcGVyc2lzdGVudC1kcmFnLWhhbmRsZT1cIlwiXG4gICAgICAgIC8+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0UGxheWxpc3RQYW5lbFJlbmRlcmVyKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1wbGF5bGlzdC1wYW5lbC1yZW5kZXJlclxuICAgICAgICAgICAgaWQ9XCJwbGF5bGlzdFwiXG4gICAgICAgICAgICBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC13YXRjaC1mbGV4eVwiXG4gICAgICAgICAgICBqcy1wYW5lbC1oZWlnaHRfPVwiXCJcbiAgICAgICAgICAgIGhhcy1wbGF5bGlzdC1idXR0b25zPVwiXCJcbiAgICAgICAgICAgIGhhcy10b29sYmFyXz1cIlwiXG4gICAgICAgICAgICBwbGF5bGlzdC10eXBlXz1cIlRMUFFcIixcbiAgICAgICAgICAgIGNvbGxhcHNpYmxlPVwiXCJcbiAgICAgICAgICAgIGNvbGxhcHNlZD1cIlwiXG4gICAgICAgIC8+XG4gICAgYCk7XG59XG5cbi8qKlxuICogSW5qZWN0IGEgWXRSZW5kZXJlZEJ1dHRvbiBpbnRvIGFuIG9iamVjdFxuICpcbiAqIEBwYXJhbSBvYmpJZCBUaGUgSWQgb2YgdGhlIG9iamVjdCB0aGUgWXRSZW5kZXJlZEJ1dHRvbiBzaG91bGQgYmUgaW5qZWN0ZWQgdG9cbiAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IG9mIHRoZSBidXR0b25cbiAqIEBwYXJhbSBpY29uIFRoZSBpY29uIG9mIHRoZSBidXR0b24gKG5lZWRzIHRvIGJlIGEgc3ZnIEVsZW1lbnQpXG4gKiBAcGFyYW0gY2IgVGhlIGZ1bmN0aW9uIHRoYXQgc2hvdWxkIGJlIGNhbGxlZCBvbiBidXR0b24gY2xpY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFl0UmVuZGVyZWRCdXR0b24ob2JqSWQ6IEpRdWVyeTxFbGVtZW50PiwgY29udGFpbmVySWQ6IHN0cmluZywgdGV4dDogc3RyaW5nIHwgbnVsbCwgaWNvbjogSlF1ZXJ5PEhUTUxFbGVtZW50PiwgY2I6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICAvLyBUaGUgY29tcGxldGUgYnV0dG9uIG5lZWRzIHRvIGJlIGluamVjdGVkIGV4YWN0bHkgbGlrZSB0aGlzXG4gICAgLy8gYmVjYXVzZSB3aGVuIHdlIGluamVjdCB0aGUgY29tcGxldGVseSBidWlsZCBidXR0b25cbiAgICAvLyBZVCByZW1vdmVzIGFsbCBpdHMgY29udGVudCBzbyB3ZSBuZWVkIHRvIHBhcnRpYWxseSBpbmplY3RcbiAgICAvLyBldmVyeXRoaW5nIGluIG9yZGVyIHRvIGdldCBpdCB0byB3b3JrXG4gICAgY29uc3QgaGFzVGV4dCA9IHRleHQgIT09IFwiXCIgJiYgdGV4dCAhPT0gbnVsbDtcblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGNyZWF0ZVl0SWNvbkJ1dHRvblJlbmRlcmVyKGNvbnRhaW5lcklkLCBoYXNUZXh0KTtcbiAgICAkKG9iaklkKVxuICAgICAgICAuYXBwZW5kKGNvbnRhaW5lcik7XG5cbiAgICBjb25zdCBhID0gY3JlYXRlWXRTaW1wbGVFbmRwb2ludCgpO1xuICAgICQoY29udGFpbmVyKVxuICAgICAgICAuYXBwZW5kKGEpO1xuXG4gICAgY29uc3QgaWNvbkJ1dHRvbiA9IGNyZWF0ZVl0SWNvbkJ1dHRvblNoZWxsKCk7XG5cbiAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBoYXNUZXh0ID8gY3JlYXRlWXRGb3JtYXR0ZWRTdHJpbmcoY2IpIDogbnVsbDtcbiAgICAkKGEpXG4gICAgICAgIC5hcHBlbmQoaWNvbkJ1dHRvbilcbiAgICAgICAgLmFwcGVuZChmb3JtYXR0ZWRTdHJpbmcpO1xuXG4gICAgaWYgKGhhc1RleHQpIHtcbiAgICAgICAgJChmb3JtYXR0ZWRTdHJpbmcpXG4gICAgICAgICAgICAudGV4dCh0ZXh0KTtcbiAgICB9XG5cbiAgICBjb25zdCBpY29uU2hlbGwgPSBjcmVhdGVZdEljb25TaGVsbCgpO1xuICAgICQoaWNvbkJ1dHRvbikuZmluZChcImJ1dHRvbiNidXR0b25cIilcbiAgICAgICAgLmFwcGVuZChpY29uU2hlbGwpXG4gICAgICAgIC5jbGljayhjYik7XG5cbiAgICAkKGljb25TaGVsbClcbiAgICAgICAgLmFwcGVuZChpY29uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVVwbmV4dCgpOiB2b2lkIHtcbiAgICAkKCd5dGQtY29tcGFjdC1hdXRvcGxheS1yZW5kZXJlci55dGQtd2F0Y2gtbmV4dC1zZWNvbmRhcnktcmVzdWx0cy1yZW5kZXJlcicpLnJlbW92ZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0VmlkZW9RdWV1ZUVsZW1lbnQob2JqOiBKUXVlcnk8RWxlbWVudD4sIHZpZGVvSWQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgYnlsaW5lOiBzdHJpbmcsIGNjYjogKCkgPT4gdm9pZCwgZGNiOiAoKSA9PiB2b2lkKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgY29uc3QgcGxheWxpc3RWaWRlb1JlbmRlcmVyID0gY3JlYXRlWXRQbGF5bGlzdFBhbmVsVmlkZW9SZW5kZXJlcigpO1xuICAgICQob2JqKVxuICAgICAgICAuYXBwZW5kKHBsYXlsaXN0VmlkZW9SZW5kZXJlcik7XG5cbiAgICBjb25zdCBtZW51UmVuZGVyZXIgPSBjcmVhdGVZdE1lbnVSZW5kZXJlcigpO1xuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdkaXYjbWVudScpXG4gICAgICAgIC5hcHBlbmQobWVudVJlbmRlcmVyKTtcblxuICAgICQobWVudVJlbmRlcmVyKS5maW5kKCd5dC1pY29uLWJ1dHRvbiNidXR0b24nKVxuICAgICAgICAuYXR0cignaGlkZGVuJywgJycpO1xuXG4gICAgaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbigkKG1lbnVSZW5kZXJlcikuZmluZCgnZGl2I3RvcC1sZXZlbC1idXR0b25zJyksIFwiXCIsIG51bGwsIGNyZWF0ZVRyYXNoSWNvbigpLCBkY2IpO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2EjdGh1bWJuYWlsID4geXQtaW1nLXNoYWRvdycpXG4gICAgICAgIC5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAndHJhbnNwYXJlbnQnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2VtcHR5Jyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2ltZyNpbWcnKVxuICAgICAgICAgICAgLmF0dHIoJ3NyYycsIGBodHRwczovL2kueXRpbWcuY29tL3ZpLyR7dmlkZW9JZH0vaHFkZWZhdWx0LmpwZ2ApO1xuXG4gICAgICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdhI3RodW1ibmFpbCA+IHl0LWltZy1zaGFkb3cnKVxuICAgICAgICAgICAgLmF0dHIoJ2xvYWRlZCcpO1xuICAgIH0sIDUwMCk7XG5cbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnYSN3Yy1lbmRwb2ludCcpXG4gICAgICAgIC5jbGljayhjY2IpO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2EjdGh1bWJuYWlsJylcbiAgICAgICAgLmNsaWNrKGNjYik7XG5cbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnc3BhbiN2aWRlby10aXRsZScpXG4gICAgICAgIC50ZXh0KHRpdGxlKTtcblxuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdzcGFuI2J5bGluZScpXG4gICAgICAgIC50ZXh0KGJ5bGluZSk7XG5cbiAgICByZXR1cm4gcGxheWxpc3RWaWRlb1JlbmRlcmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0RW1wdHlRdWV1ZVNoZWxsKHRpdGxlOiBzdHJpbmcsIGNvbGxhcHNpYmxlOiBib29sZWFuLCBjb2xsYXBzZWQ6IGJvb2xlYW4pOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICBjb25zdCByZW5kZXJlciA9IGNyZWF0ZVl0UGxheWxpc3RQYW5lbFJlbmRlcmVyKCk7XG4gICAgJCgnZGl2I3NlY29uZGFyeSAjcGxheWxpc3QnKVxuICAgICAgICAucmVwbGFjZVdpdGgocmVuZGVyZXIpO1xuXG4gICAgaWYoIWNvbGxhcHNpYmxlKSB7XG4gICAgICAgICQocmVuZGVyZXIpXG4gICAgICAgICAgICAucmVtb3ZlQXR0cignY29sbGFwc2libGUnKVxuICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NvbGxhcHNlZCcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYoIWNvbGxhcHNlZCkge1xuICAgICAgICAgICAgJChyZW5kZXJlcilcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignY29sbGFwc2VkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkKCdkaXYjc2Vjb25kYXJ5ICNwbGF5bGlzdCBoMyB5dC1mb3JtYXR0ZWQtc3RyaW5nJylcbiAgICAgICAgLnRleHQodGl0bGUpO1xuXG4gICAgcmV0dXJuIHJlbmRlcmVyO1xufSJdLCJzb3VyY2VSb290IjoiIn0=