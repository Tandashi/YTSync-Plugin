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

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const schedule_1 = __webpack_require__(/*! ./util/schedule */ "./src/util/schedule.ts");
const consts_1 = __webpack_require__(/*! ./util/consts */ "./src/util/consts.ts");
const url_1 = __webpack_require__(/*! ./util/url */ "./src/util/url.ts");
const ytHTML = __importStar(__webpack_require__(/*! ./util/yt-html */ "./src/util/yt-html.ts"));
var Message;
(function (Message) {
    Message["PLAY"] = "play";
    Message["PAUSE"] = "pause";
    Message["SEEK"] = "seek";
    Message["PLAY_VIDEO"] = "play-video";
    Message["ADD_TO_QUEUE"] = "add-to-queue";
    Message["DELETE_FROM_QUEUE"] = "delete-from-queue";
    Message["QUEUE"] = "queue";
})(Message || (Message = {}));
class Player {
    constructor(options) {
        this.options = options;
    }
    create(videoId, sessionId, queueElement) {
        this.queueElement = queueElement;
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
            // newParams.set(SessionId, oldSessionId);
            // changeQueryString(newParams.toString(), undefined);
            window.location.search = newParams.toString();
            return;
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
    populateQueue(videoIds) {
        this.queueElement.empty();
        videoIds.forEach((vId) => {
            ytHTML.injectVideoQueueElement(this.queueElement, vId, '', '', this.queueElementClickHandler(vId), this.queueElementDeleteHandler(vId));
        });
    }
    queueElementClickHandler(vId) {
        return () => {
            this.changeQueryStringVideoId(vId);
        };
    }
    queueElementDeleteHandler(vId) {
        return () => {
            this.sendWsMessage(Message.DELETE_FROM_QUEUE, vId);
        };
    }
    changeQueryStringVideoId(vid) {
        const params = new URLSearchParams(window.location.search);
        params.set('v', vid);
        url_1.changeQueryString(params.toString(), undefined);
    }
    onWsMessage(message, player) {
        try {
            const json = JSON.parse(message);
            const command = json.action;
            const data = json.data;
            console.log(`Message: ${message}`);
            const playerState = player.ytPlayer.getPlayerState();
            switch (command) {
                case Message.PLAY.toString():
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
                    this.changeQueryStringVideoId(data);
                    break;
                case Message.QUEUE.toString():
                    this.populateQueue(data.split(","));
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
        intervals.leaveButton = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                ytHTML.injectYtRenderedButton($("div#info ytd-menu-renderer div#top-level-buttons"), "leave-sync-button", "Leave Sync", ytHTML.createLeaveIcon(), () => {
                    urlParams.delete(consts_1.SessionId);
                    window.location.search = urlParams.toString();
                });
                clearInterval(intervals.leaveButton);
            }
        }, 500);
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
                player.create(videoId, sessionId, items);
                clearInterval(intervals.queue);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL2NvbnN0cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zY2hlZHVsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvd2Vic29ja2V0LnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3l0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsRkEsd0ZBQXNFO0FBQ3RFLGtGQUEwQztBQUMxQyx5RUFBK0M7QUFDL0MsZ0dBQXlDO0FBY3pDLElBQUssT0FRSjtBQVJELFdB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RUQsQ0FBQyxDQUFDLGdEQUFnRCxDQUFDO1NBQzlDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVqQixPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDO0FBckJELHNEQXFCQyIsImZpbGUiOiJsaWIudXNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3BsdWdpbi50c1wiKTtcbiIsImltcG9ydCB7IHN0YXJ0U2Vla0NoZWNrLCBzdGFydFVybENoYW5nZUNoZWNrIH0gZnJvbSBcIi4vdXRpbC9zY2hlZHVsZVwiO1xuaW1wb3J0IHsgU2Vzc2lvbklkIH0gZnJvbSBcIi4vdXRpbC9jb25zdHNcIjtcbmltcG9ydCB7IGNoYW5nZVF1ZXJ5U3RyaW5nIH0gZnJvbSBcIi4vdXRpbC91cmxcIjtcbmltcG9ydCAqIGFzIHl0SFRNTCBmcm9tICcuL3V0aWwveXQtaHRtbCc7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgV2luZG93IHsgY3VjdTogYW55OyB9XG59XG5cbmludGVyZmFjZSBQbGF5ZXJPcHRpb25zIHtcbiAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgICAgIGhvc3Q6IHN0cmluZztcbiAgICAgICAgcG9ydDogc3RyaW5nO1xuICAgIH07XG59XG5cbmVudW0gTWVzc2FnZSB7XG4gICAgUExBWSA9ICdwbGF5JyxcbiAgICBQQVVTRSA9ICdwYXVzZScsXG4gICAgU0VFSyA9ICdzZWVrJyxcbiAgICBQTEFZX1ZJREVPID0gJ3BsYXktdmlkZW8nLFxuICAgIEFERF9UT19RVUVVRSA9IFwiYWRkLXRvLXF1ZXVlXCIsXG4gICAgREVMRVRFX0ZST01fUVVFVUUgPSBcImRlbGV0ZS1mcm9tLXF1ZXVlXCIsXG4gICAgUVVFVUUgPSAncXVldWUnXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XG4gICAgcHJpdmF0ZSB5dFBsYXllcjogWVQuUGxheWVyO1xuICAgIHByaXZhdGUgd3M6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcbiAgICBwcml2YXRlIG9wdGlvbnM6IFBsYXllck9wdGlvbnM7XG4gICAgcHJpdmF0ZSBxdWV1ZUVsZW1lbnQ6IEpRdWVyeTxFbGVtZW50PjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFBsYXllck9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlKHZpZGVvSWQ6IHN0cmluZywgc2Vzc2lvbklkOiBzdHJpbmcsIHF1ZXVlRWxlbWVudDogSlF1ZXJ5PEVsZW1lbnQ+KSB7XG4gICAgICAgIHRoaXMucXVldWVFbGVtZW50ID0gcXVldWVFbGVtZW50O1xuXG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgd2luZG93LllULlBsYXllcigneXRkLXBsYXllcicsIHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICB2aWRlb0lkLFxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xuICAgICAgICAgICAgICAgIGNvbG9yOiBcInJlZFwiLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBZVC5BdXRvUGxheS5BdXRvUGxheVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIG9uUmVhZHk6IChlKSA9PiB0aGlzLm9uUmVhZHkoZSwgc2Vzc2lvbklkLCB2aWRlb0lkKSxcbiAgICAgICAgICAgICAgICBvblN0YXRlQ2hhbmdlOiAoZSkgPT4gdGhpcy5vblN0YXRlQ2hhbmdlKGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5jdWN1ID0ge307XG4gICAgICAgIHdpbmRvdy5jdWN1LnBsYXllciA9IHRoaXMueXRQbGF5ZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlYWR5KF86IFlULlBsYXllckV2ZW50LCBzZXNzaW9uSWQ6IHN0cmluZywgdmlkZW9JZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHN0YXJ0U2Vla0NoZWNrKHRoaXMueXRQbGF5ZXIsIDEwMDAsICgpID0+IHRoaXMub25QbGF5ZXJTZWVrKCkpO1xuICAgICAgICBzdGFydFVybENoYW5nZUNoZWNrKDEwMDAsIChvLCBuKSA9PiB0aGlzLm9uVXJsQ2hhbmdlKG8sIG4pKTtcblxuICAgICAgICB0aGlzLmNvbm5lY3RXcyhzZXNzaW9uSWQpO1xuICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5QTEFZX1ZJREVPLCB2aWRlb0lkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RhdGVDaGFuZ2UoZXZlbnQ6IFlULk9uU3RhdGVDaGFuZ2VFdmVudCk6IHZvaWQge1xuICAgICAgICBzd2l0Y2goZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgY2FzZSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUExBWUlORzpcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRXc1RpbWVNZXNzYWdlKE1lc3NhZ2UuUExBWSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHdpbmRvdy5ZVC5QbGF5ZXJTdGF0ZS5QQVVTRUQ6XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kV3NUaW1lTWVzc2FnZShNZXNzYWdlLlBBVVNFKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25QbGF5ZXJTZWVrKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnNlbmRXc1RpbWVNZXNzYWdlKE1lc3NhZ2UuU0VFSyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kV3NUaW1lTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuc2VuZFdzTWVzc2FnZShtZXNzYWdlLCB0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kV3NNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UsIGRhdGE6IHN0cmluZykge1xuICAgICAgICB0aGlzLndzLnNlbmQoYCR7bWVzc2FnZX0gJHtkYXRhfWApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25VcmxDaGFuZ2UobzogTG9jYXRpb24sIG46IExvY2F0aW9uKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVUkwgQ0hBTkdFOiAke28uaHJlZn0gLT4gJHtuLmhyZWZ9YCk7XG4gICAgICAgIGNvbnN0IG9sZFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoby5zZWFyY2gpO1xuICAgICAgICBjb25zdCBuZXdQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKG4uc2VhcmNoKTtcblxuICAgICAgICBjb25zdCBvbGRTZXNzaW9uSWQgPSBvbGRQYXJhbXMuZ2V0KFNlc3Npb25JZCk7XG4gICAgICAgIGNvbnN0IG5ld1Nlc3Npb25JZCA9IG5ld1BhcmFtcy5nZXQoU2Vzc2lvbklkKTtcbiAgICAgICAgaWYob2xkU2Vzc2lvbklkICE9PSBudWxsICYmIG5ld1Nlc3Npb25JZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gbmV3UGFyYW1zLnNldChTZXNzaW9uSWQsIG9sZFNlc3Npb25JZCk7XG4gICAgICAgICAgICAvLyBjaGFuZ2VRdWVyeVN0cmluZyhuZXdQYXJhbXMudG9TdHJpbmcoKSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggPSBuZXdQYXJhbXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZpZGVvSWQgPSBuZXdQYXJhbXMuZ2V0KCd2Jyk7XG4gICAgICAgIGlmKHZpZGVvSWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZFdzTWVzc2FnZShNZXNzYWdlLlBMQVlfVklERU8sIHZpZGVvSWQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYExvYWRpbmcgbmV3IFZJREVPOiAke3ZpZGVvSWR9YCk7XG4gICAgICAgICAgICB0aGlzLnl0UGxheWVyLmxvYWRWaWRlb0J5SWQodmlkZW9JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbm5lY3RXcyhzZXNzaW9uSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCB7IHByb3RvY29sLCBob3N0LCBwb3J0IH0gPSB0aGlzLm9wdGlvbnMuY29ubmVjdGlvbjtcblxuICAgICAgICB0aGlzLndzID0gaW8oYCR7cHJvdG9jb2x9Oi8vJHtob3N0fToke3BvcnR9LyR7c2Vzc2lvbklkfWAsIHtcbiAgICAgICAgICAgIGF1dG9Db25uZWN0OiB0cnVlLFxuICAgICAgICAgICAgcGF0aDogJy9zb2NrZXQuaW8nXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLndzLm9uKCdjb25uZWN0JywgKCkgPT4gdGhpcy5vbldzQ29ubmVjdGVkKCkpO1xuICAgICAgICB0aGlzLndzLm9uKCdtZXNzYWdlJywgKGQ6IHN0cmluZykgPT4gdGhpcy5vbldzTWVzc2FnZShkLCB0aGlzKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldzQ29ubmVjdGVkKCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZFwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN5bmNQbGF5ZXJUaW1lKHZpZGVvVGltZTogbnVtYmVyLCBtYXJnaW46IG51bWJlciA9IDEuMCk6IHZvaWQge1xuICAgICAgICBpZiAoTWF0aC5hYnModmlkZW9UaW1lIC0gdGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKSA+IG1hcmdpbikge1xuICAgICAgICAgICAgdGhpcy55dFBsYXllci5zZWVrVG8odmlkZW9UaW1lLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcG9wdWxhdGVRdWV1ZSh2aWRlb0lkczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5xdWV1ZUVsZW1lbnQuZW1wdHkoKTtcblxuICAgICAgICB2aWRlb0lkcy5mb3JFYWNoKCh2SWQpID0+IHtcbiAgICAgICAgICAgIHl0SFRNTC5pbmplY3RWaWRlb1F1ZXVlRWxlbWVudCh0aGlzLnF1ZXVlRWxlbWVudCwgdklkLCAnJywgJycsIHRoaXMucXVldWVFbGVtZW50Q2xpY2tIYW5kbGVyKHZJZCksIHRoaXMucXVldWVFbGVtZW50RGVsZXRlSGFuZGxlcih2SWQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBxdWV1ZUVsZW1lbnRDbGlja0hhbmRsZXIodklkOiBzdHJpbmcpOiAoKSA9PiB2b2lkIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlUXVlcnlTdHJpbmdWaWRlb0lkKHZJZCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBxdWV1ZUVsZW1lbnREZWxldGVIYW5kbGVyKHZJZDogc3RyaW5nKTogKCkgPT4gdm9pZCB7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5ERUxFVEVfRlJPTV9RVUVVRSwgdklkKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZVF1ZXJ5U3RyaW5nVmlkZW9JZCh2aWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuICAgICAgICBwYXJhbXMuc2V0KCd2JywgdmlkKTtcbiAgICAgICAgY2hhbmdlUXVlcnlTdHJpbmcocGFyYW1zLnRvU3RyaW5nKCksIHVuZGVmaW5lZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldzTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcsIHBsYXllcjogUGxheWVyKTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShtZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBqc29uLmFjdGlvbjtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBqc29uLmRhdGE7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBNZXNzYWdlOiAke21lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBsYXllclN0YXRlID0gcGxheWVyLnl0UGxheWVyLmdldFBsYXllclN0YXRlKCk7XG5cbiAgICAgICAgICAgIHN3aXRjaChjb21tYW5kKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBMQVkudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnN5bmNQbGF5ZXJUaW1lKHBhcnNlRmxvYXQoZGF0YSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHBsYXllclN0YXRlID09PSBZVC5QbGF5ZXJTdGF0ZS5QQVVTRUQpXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIucGxheVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBBVVNFLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5zeW5jUGxheWVyVGltZShwYXJzZUZsb2F0KGRhdGEpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihwbGF5ZXJTdGF0ZSA9PT0gWVQuUGxheWVyU3RhdGUuUExBWUlORylcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5wYXVzZVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlNFRUsudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnNlZWtUbyhwYXJzZUZsb2F0KGRhdGEpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBMQVlfVklERU8udG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VRdWVyeVN0cmluZ1ZpZGVvSWQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5RVUVVRS50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlUXVldWUoZGF0YS5zcGxpdChcIixcIikpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlKSB7IGNvbnNvbGUuZXJyb3IoZSk7IH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgUGxheWVyIGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0ICogYXMgeXRIVE1MIGZyb20gXCIuL3V0aWwveXQtaHRtbFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGVTZXNzaW9uSWQgfSBmcm9tIFwiLi91dGlsL3dlYnNvY2tldFwiO1xuaW1wb3J0IHsgU2Vzc2lvbklkIH0gZnJvbSBcIi4vdXRpbC9jb25zdHNcIjtcbmltcG9ydCB7IHN0YXJ0VXJsQ2hhbmdlQ2hlY2sgfSBmcm9tIFwiLi91dGlsL3NjaGVkdWxlXCI7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgIGNvbnN0IGludGVydmFscyA9IHtcbiAgICAgICAgc3luY0J1dHRvbjogbnVsbCxcbiAgICAgICAgbGVhdmVCdXR0b246IG51bGwsXG4gICAgICAgIHJlbW92ZVVwbmV4dDogbnVsbCxcbiAgICAgICAgcXVldWU6IG51bGxcbiAgICB9O1xuXG4gICAgY29uc3QgcGxheWVyID0gbmV3IFBsYXllcih7XG4gICAgICAgIGNvbm5lY3Rpb246IHtcbiAgICAgICAgICAgIHByb3RvY29sOiAnaHR0cCcsXG4gICAgICAgICAgICBob3N0OiAnMTI3LjAuMC4xJyxcbiAgICAgICAgICAgIHBvcnQ6ICc4MDgwJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCB2aWRlb0lkID0gdXJsUGFyYW1zLmdldCgndicpO1xuICAgIGNvbnN0IHNlc3Npb25JZCA9IHVybFBhcmFtcy5nZXQoU2Vzc2lvbklkKTtcblxuICAgIGlmIChzZXNzaW9uSWQgPT09IG51bGwpIHtcbiAgICAgICAgaW50ZXJ2YWxzLnN5bmNCdXR0b24gPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSkge1xuICAgICAgICAgICAgICAgIHl0SFRNTC5pbmplY3RZdFJlbmRlcmVkQnV0dG9uKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIiksIFwiY3JlYXRlLXN5bmMtYnV0dG9uXCIsIFwiQ3JlYXRlIFN5bmNcIiwgeXRIVE1MLmNyZWF0ZVBsdXNJY29uKCksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsUGFyYW1zLnNldChTZXNzaW9uSWQsIGdlbmVyYXRlU2Vzc2lvbklkKCkpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uc2VhcmNoID0gdXJsUGFyYW1zLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbHMuc3luY0J1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpbnRlcnZhbHMubGVhdmVCdXR0b24gPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSkge1xuICAgICAgICAgICAgICAgIHl0SFRNTC5pbmplY3RZdFJlbmRlcmVkQnV0dG9uKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIiksIFwibGVhdmUtc3luYy1idXR0b25cIiwgXCJMZWF2ZSBTeW5jXCIsIHl0SFRNTC5jcmVhdGVMZWF2ZUljb24oKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXMuZGVsZXRlKFNlc3Npb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggPSB1cmxQYXJhbXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5sZWF2ZUJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG5cbiAgICAgICAgaW50ZXJ2YWxzLnJlbW92ZVVwbmV4dCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwieXRkLWNvbXBhY3QtYXV0b3BsYXktcmVuZGVyZXIueXRkLXdhdGNoLW5leHQtc2Vjb25kYXJ5LXJlc3VsdHMtcmVuZGVyZXJcIikpIHtcbiAgICAgICAgICAgICAgICB5dEhUTUwucmVtb3ZlVXBuZXh0KCk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbHMucmVtb3ZlVXBuZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICBpbnRlcnZhbHMucXVldWUgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChcImRpdiNzZWNvbmRhcnkgI3BsYXlsaXN0XCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZXIgPSB5dEhUTUwuaW5qZWN0RW1wdHlRdWV1ZVNoZWxsKFwiUXVldWVcIiwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gcmVuZGVyZXIuZmluZCgnI2l0ZW1zJyk7XG4gICAgICAgICAgICAgICAgcGxheWVyLmNyZWF0ZSh2aWRlb0lkLCBzZXNzaW9uSWQsIGl0ZW1zKTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5xdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxufTsiLCJleHBvcnQgY29uc3QgU2Vzc2lvbklkID0gJ3N5bmNJZCc7IiwiZXhwb3J0IGNvbnN0IHN0YXJ0U2Vla0NoZWNrID0gKHBsYXllcjogWVQuUGxheWVyLCBpbnRlcnZhbDogbnVtYmVyLCBjYjogKCkgPT4gdm9pZCk6ICgpID0+IHZvaWQgPT4ge1xuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI5MjkzODc3L2hvdy10by1saXN0ZW4tdG8tc2Vlay1ldmVudC1pbi15b3V0dWJlLWVtYmVkLWFwaVxuICAgIGxldCBsYXN0VGltZSA9IC0xO1xuXG4gICAgY29uc3QgY2hlY2tQbGF5ZXJUaW1lID0gKCkgPT4ge1xuICAgICAgICBpZiAobGFzdFRpbWUgIT09IC0xKSB7XG4gICAgICAgICAgICBpZihwbGF5ZXIuZ2V0UGxheWVyU3RhdGUoKSA9PT0gd2luZG93LllULlBsYXllclN0YXRlLlBMQVlJTkcgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0aW5nIDEgc2Vjb25kIGludGVydmFsICwgd2l0aCA1MDAgbXMgbWFyZ2luXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRpbWUgLSBsYXN0VGltZSAtIDEpID4gMC41KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZXJlIHdhcyBhIHNlZWsgb2NjdXJpbmdcbiAgICAgICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGFzdFRpbWUgPSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHNldEludGVydmFsKGNoZWNrUGxheWVyVGltZSwgaW50ZXJ2YWwpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICB9O1xufTtcblxuXG5leHBvcnQgY29uc3Qgc3RhcnRVcmxDaGFuZ2VDaGVjayA9IChpbnRlcnZhbDogbnVtYmVyLCBjYjogKG86IExvY2F0aW9uLCBuOiBMb2NhdGlvbikgPT4gdm9pZCk6ICgpID0+IHZvaWQgPT4ge1xuICAgIGxldCBvbGQ6IExvY2F0aW9uID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh3aW5kb3cubG9jYXRpb24pKTtcbiAgICBjb25zdCBjaGVja1VSTCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHdpbmRvdy5sb2NhdGlvbjtcblxuICAgICAgICBpZihvbGQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIG9sZCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY3VycmVudCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9sZC5ocmVmICE9PSBjdXJyZW50LmhyZWYpIHtcbiAgICAgICAgICAgIGNiKG9sZCwgY3VycmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBvbGQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGN1cnJlbnQpKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHNldEludGVydmFsKGNoZWNrVVJMLCBpbnRlcnZhbCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgIH07XG59OyIsImV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VRdWVyeVN0cmluZyhzZWFyY2hTdHJpbmcsIGRvY3VtZW50VGl0bGUpIHtcbiAgICBkb2N1bWVudFRpdGxlID0gdHlwZW9mIGRvY3VtZW50VGl0bGUgIT09ICd1bmRlZmluZWQnID8gZG9jdW1lbnRUaXRsZSA6IGRvY3VtZW50LnRpdGxlO1xuICAgIGNvbnN0IHVybFNwbGl0ID0gKHdpbmRvdy5sb2NhdGlvbi5ocmVmKS5zcGxpdChcIj9cIik7XG4gICAgY29uc3Qgb2JqID0ge1xuICAgICAgICBUaXRsZTogZG9jdW1lbnRUaXRsZSxcbiAgICAgICAgVXJsOiB1cmxTcGxpdFswXSArICc/JyArIHNlYXJjaFN0cmluZ1xuICAgIH07XG5cbiAgICBoaXN0b3J5LnB1c2hTdGF0ZShvYmosIG9iai5UaXRsZSwgb2JqLlVybCk7XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU2Vzc2lvbklkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSkgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpO1xufSIsImZ1bmN0aW9uIGNyZWF0ZVN2ZyhkOiBzdHJpbmcpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDxzdmdcbiAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgICAgcHJlc2VydmVBc3BlY3RSYXRpbz1cInhNaWRZTWlkIG1lZXRcIlxuICAgICAgICAgICAgZm9jdXNhYmxlPVwiZmFsc2VcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCJcbiAgICAgICAgICAgIHN0eWxlPVwicG9pbnRlci1ldmVudHM6IG5vbmU7IGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlO1wiXG4gICAgICAgID5cbiAgICAgICAgICAgIDxnIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCIke2R9XCIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCIgLz5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgPC9zdmc+XG4gICAgYCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQbHVzSWNvbigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gY3JlYXRlU3ZnKFwiTTE5IDEzaC02djZoLTJ2LTZINXYtMmg2VjVoMnY2aDZ2MnpcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMZWF2ZUljb24oKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuIGNyZWF0ZVN2ZyhcIk0xMC4wOSAxNS41OUwxMS41IDE3bDUtNS01LTUtMS40MSAxLjQxTDEyLjY3IDExSDN2Mmg5LjY3bC0yLjU4IDIuNTl6TTE5IDNINWMtMS4xMSAwLTIgLjktMiAydjRoMlY1aDE0djE0SDV2LTRIM3Y0YzAgMS4xLjg5IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6XCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJhc2hJY29uKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiBjcmVhdGVTdmcoXCJNNiAxOWMwIDEuMS45IDIgMiAyaDhjMS4xIDAgMi0uOSAyLTJWN0g2djEyek0xOSA0aC0zLjVsLTEtMWgtNWwtMSAxSDV2MmgxNFY0elwiKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLWJ1dHRvbi1yZW5kZXJlclwiIC8+YCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0SWNvbkJ1dHRvblNoZWxsKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtaWNvbi1idXR0b24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgaWQ9XCJidXR0b25cIj5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRGb3JtYXR0ZWRTdHJpbmcoY2I6ICgpID0+IHZvaWQpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWZvcm1hdHRlZC1zdHJpbmcgaWQ9XCJ0ZXh0XCIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgLz5gKVxuICAgICAgICAuY2xpY2soY2IpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdFNpbXBsZUVuZHBvaW50KCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPGEgY2xhc3M9XCJ5dC1zaW1wbGUtZW5kcG9pbnQgc3R5bGUtc2NvcGUgeXRkLWJ1dHRvbi1yZW5kZXJlclwiIHRhYmluZGV4PVwiLTFcIj5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uQnV0dG9uUmVuZGVyZXIoaWQ6IHN0cmluZywgaGFzVGV4dDogYm9vbGVhbik6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1idXR0b24tcmVuZGVyZXJcbiAgICAgICAgICAgIGlkPVwiJHtpZH1cIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtbWVudS1yZW5kZXJlciBmb3JjZS1pY29uLWJ1dHRvbiBzdHlsZS1kZWZhdWx0IHNpemUtZGVmYXVsdFwiXG4gICAgICAgICAgICBidXR0b24tcmVuZGVyZXI9XCJcIlxuICAgICAgICAgICAgdXNlLWtleWJvYXJkLWZvY3VzZWQ9XCJcIlxuICAgICAgICAgICAgaXMtaWNvbi1idXR0b249XCJcIlxuICAgICAgICAgICAgJHshaGFzVGV4dCA/IFwiaGFzLW5vLXRleHRcIiA6IFwiXCJ9XG4gICAgICAgIC8+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0TWVudVJlbmRlcmVyKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1tZW51LXJlbmRlcmVyIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLXBsYXlsaXN0LXBhbmVsLXZpZGVvLXJlbmRlcmVyXCI+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0UGxheWxpc3RQYW5lbFZpZGVvUmVuZGVyZXIoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8eXRkLXBsYXlsaXN0LXBhbmVsLXZpZGVvLXJlbmRlcmVyXG4gICAgICAgICAgICBpZD1cInBsYXlsaXN0LWl0ZW1zXCJcbiAgICAgICAgICAgIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLXBsYXlsaXN0LXBhbmVsLXJlbmRlcmVyXCJcbiAgICAgICAgICAgIGxvY2t1cD1cIlwiXG4gICAgICAgICAgICB3YXRjaC1jb2xvci11cGRhdGVfPVwiXCJcbiAgICAgICAgICAgIGNhbi1yZW9yZGVyPVwiXCJcbiAgICAgICAgICAgIHRvdWNoLXBlcnNpc3RlbnQtZHJhZy1oYW5kbGU9XCJcIlxuICAgICAgICAvPlxuICAgIGApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdFBsYXlsaXN0UGFuZWxSZW5kZXJlcigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDx5dGQtcGxheWxpc3QtcGFuZWwtcmVuZGVyZXJcbiAgICAgICAgICAgIGlkPVwicGxheWxpc3RcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtd2F0Y2gtZmxleHlcIlxuICAgICAgICAgICAganMtcGFuZWwtaGVpZ2h0Xz1cIlwiXG4gICAgICAgICAgICBoYXMtcGxheWxpc3QtYnV0dG9ucz1cIlwiXG4gICAgICAgICAgICBoYXMtdG9vbGJhcl89XCJcIlxuICAgICAgICAgICAgcGxheWxpc3QtdHlwZV89XCJUTFBRXCIsXG4gICAgICAgICAgICBjb2xsYXBzaWJsZT1cIlwiXG4gICAgICAgICAgICBjb2xsYXBzZWQ9XCJcIlxuICAgICAgICAvPlxuICAgIGApO1xufVxuXG4vKipcbiAqIEluamVjdCBhIFl0UmVuZGVyZWRCdXR0b24gaW50byBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gb2JqSWQgVGhlIElkIG9mIHRoZSBvYmplY3QgdGhlIFl0UmVuZGVyZWRCdXR0b24gc2hvdWxkIGJlIGluamVjdGVkIHRvXG4gKiBAcGFyYW0gdGV4dCBUaGUgdGV4dCBvZiB0aGUgYnV0dG9uXG4gKiBAcGFyYW0gaWNvbiBUaGUgaWNvbiBvZiB0aGUgYnV0dG9uIChuZWVkcyB0byBiZSBhIHN2ZyBFbGVtZW50KVxuICogQHBhcmFtIGNiIFRoZSBmdW5jdGlvbiB0aGF0IHNob3VsZCBiZSBjYWxsZWQgb24gYnV0dG9uIGNsaWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RZdFJlbmRlcmVkQnV0dG9uKG9iaklkOiBKUXVlcnk8RWxlbWVudD4sIGNvbnRhaW5lcklkOiBzdHJpbmcsIHRleHQ6IHN0cmluZyB8IG51bGwsIGljb246IEpRdWVyeTxIVE1MRWxlbWVudD4sIGNiOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgLy8gVGhlIGNvbXBsZXRlIGJ1dHRvbiBuZWVkcyB0byBiZSBpbmplY3RlZCBleGFjdGx5IGxpa2UgdGhpc1xuICAgIC8vIGJlY2F1c2Ugd2hlbiB3ZSBpbmplY3QgdGhlIGNvbXBsZXRlbHkgYnVpbGQgYnV0dG9uXG4gICAgLy8gWVQgcmVtb3ZlcyBhbGwgaXRzIGNvbnRlbnQgc28gd2UgbmVlZCB0byBwYXJ0aWFsbHkgaW5qZWN0XG4gICAgLy8gZXZlcnl0aGluZyBpbiBvcmRlciB0byBnZXQgaXQgdG8gd29ya1xuICAgIGNvbnN0IGhhc1RleHQgPSB0ZXh0ICE9PSBcIlwiICYmIHRleHQgIT09IG51bGw7XG5cbiAgICBjb25zdCBjb250YWluZXIgPSBjcmVhdGVZdEljb25CdXR0b25SZW5kZXJlcihjb250YWluZXJJZCwgaGFzVGV4dCk7XG4gICAgJChvYmpJZClcbiAgICAgICAgLmFwcGVuZChjb250YWluZXIpO1xuXG4gICAgY29uc3QgYSA9IGNyZWF0ZVl0U2ltcGxlRW5kcG9pbnQoKTtcbiAgICAkKGNvbnRhaW5lcilcbiAgICAgICAgLmFwcGVuZChhKTtcblxuICAgIGNvbnN0IGljb25CdXR0b24gPSBjcmVhdGVZdEljb25CdXR0b25TaGVsbCgpO1xuXG4gICAgY29uc3QgZm9ybWF0dGVkU3RyaW5nID0gaGFzVGV4dCA/IGNyZWF0ZVl0Rm9ybWF0dGVkU3RyaW5nKGNiKSA6IG51bGw7XG4gICAgJChhKVxuICAgICAgICAuYXBwZW5kKGljb25CdXR0b24pXG4gICAgICAgIC5hcHBlbmQoZm9ybWF0dGVkU3RyaW5nKTtcblxuICAgIGlmIChoYXNUZXh0KSB7XG4gICAgICAgICQoZm9ybWF0dGVkU3RyaW5nKVxuICAgICAgICAgICAgLnRleHQodGV4dCk7XG4gICAgfVxuXG4gICAgY29uc3QgaWNvblNoZWxsID0gY3JlYXRlWXRJY29uU2hlbGwoKTtcbiAgICAkKGljb25CdXR0b24pLmZpbmQoXCJidXR0b24jYnV0dG9uXCIpXG4gICAgICAgIC5hcHBlbmQoaWNvblNoZWxsKVxuICAgICAgICAuY2xpY2soY2IpO1xuXG4gICAgJChpY29uU2hlbGwpXG4gICAgICAgIC5hcHBlbmQoaWNvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVVcG5leHQoKTogdm9pZCB7XG4gICAgJCgneXRkLWNvbXBhY3QtYXV0b3BsYXktcmVuZGVyZXIueXRkLXdhdGNoLW5leHQtc2Vjb25kYXJ5LXJlc3VsdHMtcmVuZGVyZXInKS5yZW1vdmUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFZpZGVvUXVldWVFbGVtZW50KG9iajogSlF1ZXJ5PEVsZW1lbnQ+LCB2aWRlb0lkOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIGJ5bGluZTogc3RyaW5nLCBjY2I6ICgpID0+IHZvaWQsIGRjYjogKCkgPT4gdm9pZCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIGNvbnN0IHBsYXlsaXN0VmlkZW9SZW5kZXJlciA9IGNyZWF0ZVl0UGxheWxpc3RQYW5lbFZpZGVvUmVuZGVyZXIoKTtcbiAgICAkKG9iailcbiAgICAgICAgLmFwcGVuZChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpO1xuXG4gICAgY29uc3QgbWVudVJlbmRlcmVyID0gY3JlYXRlWXRNZW51UmVuZGVyZXIoKTtcbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnZGl2I21lbnUnKVxuICAgICAgICAuYXBwZW5kKG1lbnVSZW5kZXJlcik7XG5cbiAgICAkKG1lbnVSZW5kZXJlcikuZmluZCgneXQtaWNvbi1idXR0b24jYnV0dG9uJylcbiAgICAgICAgLmF0dHIoJ2hpZGRlbicsICcnKTtcblxuICAgIGluamVjdFl0UmVuZGVyZWRCdXR0b24oJChtZW51UmVuZGVyZXIpLmZpbmQoJ2RpdiN0b3AtbGV2ZWwtYnV0dG9ucycpLCBcIlwiLCBudWxsLCBjcmVhdGVUcmFzaEljb24oKSwgZGNiKTtcblxuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdhI3RodW1ibmFpbCA+IHl0LWltZy1zaGFkb3cnKVxuICAgICAgICAuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJywgJ3RyYW5zcGFyZW50JylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdlbXB0eScpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdpbWcjaW1nJylcbiAgICAgICAgICAgIC5hdHRyKCdzcmMnLCBgaHR0cHM6Ly9pLnl0aW1nLmNvbS92aS8ke3ZpZGVvSWR9L2hxZGVmYXVsdC5qcGdgKTtcblxuICAgICAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnYSN0aHVtYm5haWwgPiB5dC1pbWctc2hhZG93JylcbiAgICAgICAgICAgIC5hdHRyKCdsb2FkZWQnKTtcbiAgICB9LCA1MDApO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2Ejd2MtZW5kcG9pbnQnKVxuICAgICAgICAuY2xpY2soY2NiKTtcblxuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdhI3RodW1ibmFpbCcpXG4gICAgICAgIC5jbGljayhjY2IpO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ3NwYW4jdmlkZW8tdGl0bGUnKVxuICAgICAgICAudGV4dCh0aXRsZSk7XG5cbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnc3BhbiNieWxpbmUnKVxuICAgICAgICAudGV4dChieWxpbmUpO1xuXG4gICAgcmV0dXJuIHBsYXlsaXN0VmlkZW9SZW5kZXJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdEVtcHR5UXVldWVTaGVsbCh0aXRsZTogc3RyaW5nLCBjb2xsYXBzaWJsZTogYm9vbGVhbiwgY29sbGFwc2VkOiBib29sZWFuKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgY29uc3QgcmVuZGVyZXIgPSBjcmVhdGVZdFBsYXlsaXN0UGFuZWxSZW5kZXJlcigpO1xuICAgICQoJ2RpdiNzZWNvbmRhcnkgI3BsYXlsaXN0JylcbiAgICAgICAgLnJlcGxhY2VXaXRoKHJlbmRlcmVyKTtcblxuICAgIGlmKCFjb2xsYXBzaWJsZSkge1xuICAgICAgICAkKHJlbmRlcmVyKVxuICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NvbGxhcHNpYmxlJylcbiAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdjb2xsYXBzZWQnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmKCFjb2xsYXBzZWQpIHtcbiAgICAgICAgICAgICQocmVuZGVyZXIpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NvbGxhcHNlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJCgnZGl2I3NlY29uZGFyeSAjcGxheWxpc3QgaDMgeXQtZm9ybWF0dGVkLXN0cmluZycpXG4gICAgICAgIC50ZXh0KHRpdGxlKTtcblxuICAgIHJldHVybiByZW5kZXJlcjtcbn0iXSwic291cmNlUm9vdCI6IiJ9