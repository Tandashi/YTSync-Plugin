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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL2NvbnN0cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zY2hlZHVsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvd2Vic29ja2V0LnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3l0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsRkEsd0ZBQXNFO0FBQ3RFLGtGQUEwQztBQUMxQyx5RUFBK0M7QUFDL0MsZ0dBQXlDO0FBY3pDLElBQUssT0FRSjtBQVJELFdB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Q0FBQyxnREFBZ0QsQ0FBQztTQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakIsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQztBQXJCRCxzREFxQkMiLCJmaWxlIjoibGliLnVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9wbHVnaW4udHNcIik7XG4iLCJpbXBvcnQgeyBzdGFydFNlZWtDaGVjaywgc3RhcnRVcmxDaGFuZ2VDaGVjayB9IGZyb20gXCIuL3V0aWwvc2NoZWR1bGVcIjtcbmltcG9ydCB7IFNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvY29uc3RzXCI7XG5pbXBvcnQgeyBjaGFuZ2VRdWVyeVN0cmluZyB9IGZyb20gXCIuL3V0aWwvdXJsXCI7XG5pbXBvcnQgKiBhcyB5dEhUTUwgZnJvbSAnLi91dGlsL3l0LWh0bWwnO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7IGN1Y3U6IGFueTsgfVxufVxuXG5pbnRlcmZhY2UgUGxheWVyT3B0aW9ucyB7XG4gICAgY29ubmVjdGlvbjoge1xuICAgICAgICBwcm90b2NvbDogc3RyaW5nO1xuICAgICAgICBob3N0OiBzdHJpbmc7XG4gICAgICAgIHBvcnQ6IHN0cmluZztcbiAgICB9O1xufVxuXG5lbnVtIE1lc3NhZ2Uge1xuICAgIFBMQVkgPSAncGxheScsXG4gICAgUEFVU0UgPSAncGF1c2UnLFxuICAgIFNFRUsgPSAnc2VlaycsXG4gICAgUExBWV9WSURFTyA9ICdwbGF5LXZpZGVvJyxcbiAgICBBRERfVE9fUVVFVUUgPSBcImFkZC10by1xdWV1ZVwiLFxuICAgIERFTEVURV9GUk9NX1FVRVVFID0gXCJkZWxldGUtZnJvbS1xdWV1ZVwiLFxuICAgIFFVRVVFID0gJ3F1ZXVlJ1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXIge1xuICAgIHByaXZhdGUgeXRQbGF5ZXI6IFlULlBsYXllcjtcbiAgICBwcml2YXRlIHdzOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQ7XG4gICAgcHJpdmF0ZSBvcHRpb25zOiBQbGF5ZXJPcHRpb25zO1xuICAgIHByaXZhdGUgcXVldWVFbGVtZW50OiBKUXVlcnk8RWxlbWVudD47XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQbGF5ZXJPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZSh2aWRlb0lkOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nLCBxdWV1ZUVsZW1lbnQ6IEpRdWVyeTxFbGVtZW50Pikge1xuICAgICAgICB0aGlzLnF1ZXVlRWxlbWVudCA9IHF1ZXVlRWxlbWVudDtcblxuICAgICAgICB0aGlzLnl0UGxheWVyID0gbmV3IHdpbmRvdy5ZVC5QbGF5ZXIoJ3l0ZC1wbGF5ZXInLCB7XG4gICAgICAgICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgdmlkZW9JZCxcbiAgICAgICAgICAgIHBsYXllclZhcnM6IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogXCJyZWRcIixcbiAgICAgICAgICAgICAgICBhdXRvcGxheTogWVQuQXV0b1BsYXkuQXV0b1BsYXlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICAgICBvblJlYWR5OiAoZSkgPT4gdGhpcy5vblJlYWR5KGUsIHNlc3Npb25JZCwgdmlkZW9JZCksXG4gICAgICAgICAgICAgICAgb25TdGF0ZUNoYW5nZTogKGUpID0+IHRoaXMub25TdGF0ZUNoYW5nZShlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuY3VjdSA9IHt9O1xuICAgICAgICB3aW5kb3cuY3VjdS5wbGF5ZXIgPSB0aGlzLnl0UGxheWVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25SZWFkeShfOiBZVC5QbGF5ZXJFdmVudCwgc2Vzc2lvbklkOiBzdHJpbmcsIHZpZGVvSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBzdGFydFNlZWtDaGVjayh0aGlzLnl0UGxheWVyLCAxMDAwLCAoKSA9PiB0aGlzLm9uUGxheWVyU2VlaygpKTtcbiAgICAgICAgc3RhcnRVcmxDaGFuZ2VDaGVjaygxMDAwLCAobywgbikgPT4gdGhpcy5vblVybENoYW5nZShvLCBuKSk7XG5cbiAgICAgICAgdGhpcy5jb25uZWN0V3Moc2Vzc2lvbklkKTtcbiAgICAgICAgdGhpcy5zZW5kV3NNZXNzYWdlKE1lc3NhZ2UuUExBWV9WSURFTywgdmlkZW9JZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN0YXRlQ2hhbmdlKGV2ZW50OiBZVC5PblN0YXRlQ2hhbmdlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoKGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIGNhc2Ugd2luZG93LllULlBsYXllclN0YXRlLlBMQVlJTkc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kV3NUaW1lTWVzc2FnZShNZXNzYWdlLlBMQVkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUEFVU0VEOlxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZFdzVGltZU1lc3NhZ2UoTWVzc2FnZS5QQVVTRSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUGxheWVyU2VlaygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zZW5kV3NUaW1lTWVzc2FnZShNZXNzYWdlLlNFRUspO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VuZFdzVGltZU1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UobWVzc2FnZSwgdGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VuZFdzTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlLCBkYXRhOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy53cy5zZW5kKGAke21lc3NhZ2V9ICR7ZGF0YX1gKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVXJsQ2hhbmdlKG86IExvY2F0aW9uLCBuOiBMb2NhdGlvbik6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgVVJMIENIQU5HRTogJHtvLmhyZWZ9IC0+ICR7bi5ocmVmfWApO1xuICAgICAgICBjb25zdCBvbGRQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKG8uc2VhcmNoKTtcbiAgICAgICAgY29uc3QgbmV3UGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhuLnNlYXJjaCk7XG5cbiAgICAgICAgY29uc3Qgb2xkU2Vzc2lvbklkID0gb2xkUGFyYW1zLmdldChTZXNzaW9uSWQpO1xuICAgICAgICBjb25zdCBuZXdTZXNzaW9uSWQgPSBuZXdQYXJhbXMuZ2V0KFNlc3Npb25JZCk7XG4gICAgICAgIGlmKG9sZFNlc3Npb25JZCAhPT0gbnVsbCAmJiBuZXdTZXNzaW9uSWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIG5ld1BhcmFtcy5zZXQoU2Vzc2lvbklkLCBvbGRTZXNzaW9uSWQpO1xuICAgICAgICAgICAgLy8gY2hhbmdlUXVlcnlTdHJpbmcobmV3UGFyYW1zLnRvU3RyaW5nKCksIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uc2VhcmNoID0gbmV3UGFyYW1zLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2aWRlb0lkID0gbmV3UGFyYW1zLmdldCgndicpO1xuICAgICAgICBpZih2aWRlb0lkICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5QTEFZX1ZJREVPLCB2aWRlb0lkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMb2FkaW5nIG5ldyBWSURFTzogJHt2aWRlb0lkfWApO1xuICAgICAgICAgICAgdGhpcy55dFBsYXllci5sb2FkVmlkZW9CeUlkKHZpZGVvSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25uZWN0V3Moc2Vzc2lvbklkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBwcm90b2NvbCwgaG9zdCwgcG9ydCB9ID0gdGhpcy5vcHRpb25zLmNvbm5lY3Rpb247XG5cbiAgICAgICAgdGhpcy53cyA9IGlvKGAke3Byb3RvY29sfTovLyR7aG9zdH06JHtwb3J0fS8ke3Nlc3Npb25JZH1gLCB7XG4gICAgICAgICAgICBhdXRvQ29ubmVjdDogdHJ1ZSxcbiAgICAgICAgICAgIHBhdGg6ICcvc29ja2V0LmlvJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53cy5vbignY29ubmVjdCcsICgpID0+IHRoaXMub25Xc0Nvbm5lY3RlZCgpKTtcbiAgICAgICAgdGhpcy53cy5vbignbWVzc2FnZScsIChkOiBzdHJpbmcpID0+IHRoaXMub25Xc01lc3NhZ2UoZCwgdGhpcykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Xc0Nvbm5lY3RlZCgpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDb25uZWN0ZWRcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzeW5jUGxheWVyVGltZSh2aWRlb1RpbWU6IG51bWJlciwgbWFyZ2luOiBudW1iZXIgPSAxLjApOiB2b2lkIHtcbiAgICAgICAgaWYgKE1hdGguYWJzKHZpZGVvVGltZSAtIHRoaXMueXRQbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSkgPiBtYXJnaW4pIHtcbiAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIuc2Vla1RvKHZpZGVvVGltZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHBvcHVsYXRlUXVldWUodmlkZW9JZHM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgICAgIHRoaXMucXVldWVFbGVtZW50LmVtcHR5KCk7XG5cbiAgICAgICAgdmlkZW9JZHMuZm9yRWFjaCgodklkKSA9PiB7XG4gICAgICAgICAgICB5dEhUTUwuaW5qZWN0VmlkZW9RdWV1ZUVsZW1lbnQodGhpcy5xdWV1ZUVsZW1lbnQsIHZJZCwgJycsICcnLCB0aGlzLnF1ZXVlRWxlbWVudENsaWNrSGFuZGxlcih2SWQpLCB0aGlzLnF1ZXVlRWxlbWVudERlbGV0ZUhhbmRsZXIodklkKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcXVldWVFbGVtZW50Q2xpY2tIYW5kbGVyKHZJZDogc3RyaW5nKTogKCkgPT4gdm9pZCB7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZVF1ZXJ5U3RyaW5nVmlkZW9JZCh2SWQpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgcXVldWVFbGVtZW50RGVsZXRlSGFuZGxlcih2SWQ6IHN0cmluZyk6ICgpID0+IHZvaWQge1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZW5kV3NNZXNzYWdlKE1lc3NhZ2UuREVMRVRFX0ZST01fUVVFVUUsIHZJZCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VRdWVyeVN0cmluZ1ZpZGVvSWQodmlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICAgICAgcGFyYW1zLnNldCgndicsIHZpZCk7XG4gICAgICAgIGNoYW5nZVF1ZXJ5U3RyaW5nKHBhcmFtcy50b1N0cmluZygpLCB1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Xc01lc3NhZ2UobWVzc2FnZTogc3RyaW5nLCBwbGF5ZXI6IFBsYXllcik6IHZvaWQge1xuICAgICAgICBjb25zdCBbY29tbWFuZCwgZGF0YV0gPSBtZXNzYWdlLnNwbGl0KFwiIFwiKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgTWVzc2FnZTogJHttZXNzYWdlfWApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJTdGF0ZSA9IHBsYXllci55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpO1xuXG4gICAgICAgICAgICBzd2l0Y2goY29tbWFuZCkge1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5QTEFZLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQbGF5ZXIgU3RhdGU6ICR7cGxheWVyU3RhdGV9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnN5bmNQbGF5ZXJUaW1lKHBhcnNlRmxvYXQoZGF0YSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHBsYXllclN0YXRlID09PSBZVC5QbGF5ZXJTdGF0ZS5QQVVTRUQpXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIucGxheVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBBVVNFLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5zeW5jUGxheWVyVGltZShwYXJzZUZsb2F0KGRhdGEpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihwbGF5ZXJTdGF0ZSA9PT0gWVQuUGxheWVyU3RhdGUuUExBWUlORylcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5wYXVzZVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlNFRUsudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnNlZWtUbyhwYXJzZUZsb2F0KGRhdGEpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBMQVlfVklERU8udG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VRdWVyeVN0cmluZ1ZpZGVvSWQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5RVUVVRS50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlUXVldWUoZGF0YS5zcGxpdChcIixcIikpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlKSB7IGNvbnNvbGUuZXJyb3IoZSk7IH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgUGxheWVyIGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0ICogYXMgeXRIVE1MIGZyb20gXCIuL3V0aWwveXQtaHRtbFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGVTZXNzaW9uSWQgfSBmcm9tIFwiLi91dGlsL3dlYnNvY2tldFwiO1xuaW1wb3J0IHsgU2Vzc2lvbklkIH0gZnJvbSBcIi4vdXRpbC9jb25zdHNcIjtcbmltcG9ydCB7IHN0YXJ0VXJsQ2hhbmdlQ2hlY2sgfSBmcm9tIFwiLi91dGlsL3NjaGVkdWxlXCI7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgIGNvbnN0IGludGVydmFscyA9IHtcbiAgICAgICAgc3luY0J1dHRvbjogbnVsbCxcbiAgICAgICAgbGVhdmVCdXR0b246IG51bGwsXG4gICAgICAgIHJlbW92ZVVwbmV4dDogbnVsbCxcbiAgICAgICAgcXVldWU6IG51bGxcbiAgICB9O1xuXG4gICAgY29uc3QgcGxheWVyID0gbmV3IFBsYXllcih7XG4gICAgICAgIGNvbm5lY3Rpb246IHtcbiAgICAgICAgICAgIHByb3RvY29sOiAnaHR0cCcsXG4gICAgICAgICAgICBob3N0OiAnMTI3LjAuMC4xJyxcbiAgICAgICAgICAgIHBvcnQ6ICc4MDgwJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCB2aWRlb0lkID0gdXJsUGFyYW1zLmdldCgndicpO1xuICAgIGNvbnN0IHNlc3Npb25JZCA9IHVybFBhcmFtcy5nZXQoU2Vzc2lvbklkKTtcblxuICAgIGlmIChzZXNzaW9uSWQgPT09IG51bGwpIHtcbiAgICAgICAgaW50ZXJ2YWxzLnN5bmNCdXR0b24gPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSkge1xuICAgICAgICAgICAgICAgIHl0SFRNTC5pbmplY3RZdFJlbmRlcmVkQnV0dG9uKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIiksIFwiY3JlYXRlLXN5bmMtYnV0dG9uXCIsIFwiQ3JlYXRlIFN5bmNcIiwgeXRIVE1MLmNyZWF0ZVBsdXNJY29uKCksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsUGFyYW1zLnNldChTZXNzaW9uSWQsIGdlbmVyYXRlU2Vzc2lvbklkKCkpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uc2VhcmNoID0gdXJsUGFyYW1zLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbHMuc3luY0J1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpbnRlcnZhbHMubGVhdmVCdXR0b24gPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSkge1xuICAgICAgICAgICAgICAgIHl0SFRNTC5pbmplY3RZdFJlbmRlcmVkQnV0dG9uKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIiksIFwibGVhdmUtc3luYy1idXR0b25cIiwgXCJMZWF2ZSBTeW5jXCIsIHl0SFRNTC5jcmVhdGVMZWF2ZUljb24oKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXMuZGVsZXRlKFNlc3Npb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggPSB1cmxQYXJhbXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5sZWF2ZUJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG5cbiAgICAgICAgaW50ZXJ2YWxzLnJlbW92ZVVwbmV4dCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwieXRkLWNvbXBhY3QtYXV0b3BsYXktcmVuZGVyZXIueXRkLXdhdGNoLW5leHQtc2Vjb25kYXJ5LXJlc3VsdHMtcmVuZGVyZXJcIikpIHtcbiAgICAgICAgICAgICAgICB5dEhUTUwucmVtb3ZlVXBuZXh0KCk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbHMucmVtb3ZlVXBuZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICBpbnRlcnZhbHMucXVldWUgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChcImRpdiNzZWNvbmRhcnkgI3BsYXlsaXN0XCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZXIgPSB5dEhUTUwuaW5qZWN0RW1wdHlRdWV1ZVNoZWxsKFwiUXVldWVcIiwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gcmVuZGVyZXIuZmluZCgnI2l0ZW1zJyk7XG4gICAgICAgICAgICAgICAgcGxheWVyLmNyZWF0ZSh2aWRlb0lkLCBzZXNzaW9uSWQsIGl0ZW1zKTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5xdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxufTsiLCJleHBvcnQgY29uc3QgU2Vzc2lvbklkID0gJ3N5bmNJZCc7IiwiZXhwb3J0IGNvbnN0IHN0YXJ0U2Vla0NoZWNrID0gKHBsYXllcjogWVQuUGxheWVyLCBpbnRlcnZhbDogbnVtYmVyLCBjYjogKCkgPT4gdm9pZCk6ICgpID0+IHZvaWQgPT4ge1xuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI5MjkzODc3L2hvdy10by1saXN0ZW4tdG8tc2Vlay1ldmVudC1pbi15b3V0dWJlLWVtYmVkLWFwaVxuICAgIGxldCBsYXN0VGltZSA9IC0xO1xuXG4gICAgY29uc3QgY2hlY2tQbGF5ZXJUaW1lID0gKCkgPT4ge1xuICAgICAgICBpZiAobGFzdFRpbWUgIT09IC0xKSB7XG4gICAgICAgICAgICBpZihwbGF5ZXIuZ2V0UGxheWVyU3RhdGUoKSA9PT0gd2luZG93LllULlBsYXllclN0YXRlLlBMQVlJTkcgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0aW5nIDEgc2Vjb25kIGludGVydmFsICwgd2l0aCA1MDAgbXMgbWFyZ2luXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRpbWUgLSBsYXN0VGltZSAtIDEpID4gMC41KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZXJlIHdhcyBhIHNlZWsgb2NjdXJpbmdcbiAgICAgICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGFzdFRpbWUgPSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHNldEludGVydmFsKGNoZWNrUGxheWVyVGltZSwgaW50ZXJ2YWwpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICB9O1xufTtcblxuXG5leHBvcnQgY29uc3Qgc3RhcnRVcmxDaGFuZ2VDaGVjayA9IChpbnRlcnZhbDogbnVtYmVyLCBjYjogKG86IExvY2F0aW9uLCBuOiBMb2NhdGlvbikgPT4gdm9pZCk6ICgpID0+IHZvaWQgPT4ge1xuICAgIGxldCBvbGQ6IExvY2F0aW9uID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh3aW5kb3cubG9jYXRpb24pKTtcbiAgICBjb25zdCBjaGVja1VSTCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHdpbmRvdy5sb2NhdGlvbjtcblxuICAgICAgICBpZihvbGQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIG9sZCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY3VycmVudCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9sZC5ocmVmICE9PSBjdXJyZW50LmhyZWYpIHtcbiAgICAgICAgICAgIGNiKG9sZCwgY3VycmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBvbGQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGN1cnJlbnQpKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHNldEludGVydmFsKGNoZWNrVVJMLCBpbnRlcnZhbCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgIH07XG59OyIsImV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VRdWVyeVN0cmluZyhzZWFyY2hTdHJpbmcsIGRvY3VtZW50VGl0bGUpIHtcbiAgICBkb2N1bWVudFRpdGxlID0gdHlwZW9mIGRvY3VtZW50VGl0bGUgIT09ICd1bmRlZmluZWQnID8gZG9jdW1lbnRUaXRsZSA6IGRvY3VtZW50LnRpdGxlO1xuICAgIGNvbnN0IHVybFNwbGl0ID0gKHdpbmRvdy5sb2NhdGlvbi5ocmVmKS5zcGxpdChcIj9cIik7XG4gICAgY29uc3Qgb2JqID0ge1xuICAgICAgICBUaXRsZTogZG9jdW1lbnRUaXRsZSxcbiAgICAgICAgVXJsOiB1cmxTcGxpdFswXSArICc/JyArIHNlYXJjaFN0cmluZ1xuICAgIH07XG5cbiAgICBoaXN0b3J5LnB1c2hTdGF0ZShvYmosIG9iai5UaXRsZSwgb2JqLlVybCk7XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU2Vzc2lvbklkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSkgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpO1xufSIsImZ1bmN0aW9uIGNyZWF0ZVN2ZyhkOiBzdHJpbmcpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDxzdmdcbiAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgICAgcHJlc2VydmVBc3BlY3RSYXRpbz1cInhNaWRZTWlkIG1lZXRcIlxuICAgICAgICAgICAgZm9jdXNhYmxlPVwiZmFsc2VcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCJcbiAgICAgICAgICAgIHN0eWxlPVwicG9pbnRlci1ldmVudHM6IG5vbmU7IGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlO1wiXG4gICAgICAgID5cbiAgICAgICAgICAgIDxnIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCIke2R9XCIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCIgLz5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgPC9zdmc+XG4gICAgYCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQbHVzSWNvbigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gY3JlYXRlU3ZnKFwiTTE5IDEzaC02djZoLTJ2LTZINXYtMmg2VjVoMnY2aDZ2MnpcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMZWF2ZUljb24oKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuIGNyZWF0ZVN2ZyhcIk0xMC4wOSAxNS41OUwxMS41IDE3bDUtNS01LTUtMS40MSAxLjQxTDEyLjY3IDExSDN2Mmg5LjY3bC0yLjU4IDIuNTl6TTE5IDNINWMtMS4xMSAwLTIgLjktMiAydjRoMlY1aDE0djE0SDV2LTRIM3Y0YzAgMS4xLjg5IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6XCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJhc2hJY29uKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiBjcmVhdGVTdmcoXCJNNiAxOWMwIDEuMS45IDIgMiAyaDhjMS4xIDAgMi0uOSAyLTJWN0g2djEyek0xOSA0aC0zLjVsLTEtMWgtNWwtMSAxSDV2MmgxNFY0elwiKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLWJ1dHRvbi1yZW5kZXJlclwiIC8+YCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0SWNvbkJ1dHRvblNoZWxsKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtaWNvbi1idXR0b24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgaWQ9XCJidXR0b25cIj5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRGb3JtYXR0ZWRTdHJpbmcoY2I6ICgpID0+IHZvaWQpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWZvcm1hdHRlZC1zdHJpbmcgaWQ9XCJ0ZXh0XCIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgLz5gKVxuICAgICAgICAuY2xpY2soY2IpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdFNpbXBsZUVuZHBvaW50KCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPGEgY2xhc3M9XCJ5dC1zaW1wbGUtZW5kcG9pbnQgc3R5bGUtc2NvcGUgeXRkLWJ1dHRvbi1yZW5kZXJlclwiIHRhYmluZGV4PVwiLTFcIj5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uQnV0dG9uUmVuZGVyZXIoaWQ6IHN0cmluZywgaGFzVGV4dDogYm9vbGVhbik6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1idXR0b24tcmVuZGVyZXJcbiAgICAgICAgICAgIGlkPVwiJHtpZH1cIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtbWVudS1yZW5kZXJlciBmb3JjZS1pY29uLWJ1dHRvbiBzdHlsZS1kZWZhdWx0IHNpemUtZGVmYXVsdFwiXG4gICAgICAgICAgICBidXR0b24tcmVuZGVyZXI9XCJcIlxuICAgICAgICAgICAgdXNlLWtleWJvYXJkLWZvY3VzZWQ9XCJcIlxuICAgICAgICAgICAgaXMtaWNvbi1idXR0b249XCJcIlxuICAgICAgICAgICAgJHshaGFzVGV4dCA/IFwiaGFzLW5vLXRleHRcIiA6IFwiXCJ9XG4gICAgICAgIC8+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0TWVudVJlbmRlcmVyKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1tZW51LXJlbmRlcmVyIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLXBsYXlsaXN0LXBhbmVsLXZpZGVvLXJlbmRlcmVyXCI+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0UGxheWxpc3RQYW5lbFZpZGVvUmVuZGVyZXIoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8eXRkLXBsYXlsaXN0LXBhbmVsLXZpZGVvLXJlbmRlcmVyXG4gICAgICAgICAgICBpZD1cInBsYXlsaXN0LWl0ZW1zXCJcbiAgICAgICAgICAgIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLXBsYXlsaXN0LXBhbmVsLXJlbmRlcmVyXCJcbiAgICAgICAgICAgIGxvY2t1cD1cIlwiXG4gICAgICAgICAgICB3YXRjaC1jb2xvci11cGRhdGVfPVwiXCJcbiAgICAgICAgICAgIGNhbi1yZW9yZGVyPVwiXCJcbiAgICAgICAgICAgIHRvdWNoLXBlcnNpc3RlbnQtZHJhZy1oYW5kbGU9XCJcIlxuICAgICAgICAvPlxuICAgIGApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdFBsYXlsaXN0UGFuZWxSZW5kZXJlcigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDx5dGQtcGxheWxpc3QtcGFuZWwtcmVuZGVyZXJcbiAgICAgICAgICAgIGlkPVwicGxheWxpc3RcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtd2F0Y2gtZmxleHlcIlxuICAgICAgICAgICAganMtcGFuZWwtaGVpZ2h0Xz1cIlwiXG4gICAgICAgICAgICBoYXMtcGxheWxpc3QtYnV0dG9ucz1cIlwiXG4gICAgICAgICAgICBoYXMtdG9vbGJhcl89XCJcIlxuICAgICAgICAgICAgcGxheWxpc3QtdHlwZV89XCJUTFBRXCIsXG4gICAgICAgICAgICBjb2xsYXBzaWJsZT1cIlwiXG4gICAgICAgICAgICBjb2xsYXBzZWQ9XCJcIlxuICAgICAgICAvPlxuICAgIGApO1xufVxuXG4vKipcbiAqIEluamVjdCBhIFl0UmVuZGVyZWRCdXR0b24gaW50byBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gb2JqSWQgVGhlIElkIG9mIHRoZSBvYmplY3QgdGhlIFl0UmVuZGVyZWRCdXR0b24gc2hvdWxkIGJlIGluamVjdGVkIHRvXG4gKiBAcGFyYW0gdGV4dCBUaGUgdGV4dCBvZiB0aGUgYnV0dG9uXG4gKiBAcGFyYW0gaWNvbiBUaGUgaWNvbiBvZiB0aGUgYnV0dG9uIChuZWVkcyB0byBiZSBhIHN2ZyBFbGVtZW50KVxuICogQHBhcmFtIGNiIFRoZSBmdW5jdGlvbiB0aGF0IHNob3VsZCBiZSBjYWxsZWQgb24gYnV0dG9uIGNsaWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RZdFJlbmRlcmVkQnV0dG9uKG9iaklkOiBKUXVlcnk8RWxlbWVudD4sIGNvbnRhaW5lcklkOiBzdHJpbmcsIHRleHQ6IHN0cmluZyB8IG51bGwsIGljb246IEpRdWVyeTxIVE1MRWxlbWVudD4sIGNiOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgLy8gVGhlIGNvbXBsZXRlIGJ1dHRvbiBuZWVkcyB0byBiZSBpbmplY3RlZCBleGFjdGx5IGxpa2UgdGhpc1xuICAgIC8vIGJlY2F1c2Ugd2hlbiB3ZSBpbmplY3QgdGhlIGNvbXBsZXRlbHkgYnVpbGQgYnV0dG9uXG4gICAgLy8gWVQgcmVtb3ZlcyBhbGwgaXRzIGNvbnRlbnQgc28gd2UgbmVlZCB0byBwYXJ0aWFsbHkgaW5qZWN0XG4gICAgLy8gZXZlcnl0aGluZyBpbiBvcmRlciB0byBnZXQgaXQgdG8gd29ya1xuICAgIGNvbnN0IGhhc1RleHQgPSB0ZXh0ICE9PSBcIlwiICYmIHRleHQgIT09IG51bGw7XG5cbiAgICBjb25zdCBjb250YWluZXIgPSBjcmVhdGVZdEljb25CdXR0b25SZW5kZXJlcihjb250YWluZXJJZCwgaGFzVGV4dCk7XG4gICAgJChvYmpJZClcbiAgICAgICAgLmFwcGVuZChjb250YWluZXIpO1xuXG4gICAgY29uc3QgYSA9IGNyZWF0ZVl0U2ltcGxlRW5kcG9pbnQoKTtcbiAgICAkKGNvbnRhaW5lcilcbiAgICAgICAgLmFwcGVuZChhKTtcblxuICAgIGNvbnN0IGljb25CdXR0b24gPSBjcmVhdGVZdEljb25CdXR0b25TaGVsbCgpO1xuXG4gICAgY29uc3QgZm9ybWF0dGVkU3RyaW5nID0gaGFzVGV4dCA/IGNyZWF0ZVl0Rm9ybWF0dGVkU3RyaW5nKGNiKSA6IG51bGw7XG4gICAgJChhKVxuICAgICAgICAuYXBwZW5kKGljb25CdXR0b24pXG4gICAgICAgIC5hcHBlbmQoZm9ybWF0dGVkU3RyaW5nKTtcblxuICAgIGlmIChoYXNUZXh0KSB7XG4gICAgICAgICQoZm9ybWF0dGVkU3RyaW5nKVxuICAgICAgICAgICAgLnRleHQodGV4dCk7XG4gICAgfVxuXG4gICAgY29uc3QgaWNvblNoZWxsID0gY3JlYXRlWXRJY29uU2hlbGwoKTtcbiAgICAkKGljb25CdXR0b24pLmZpbmQoXCJidXR0b24jYnV0dG9uXCIpXG4gICAgICAgIC5hcHBlbmQoaWNvblNoZWxsKVxuICAgICAgICAuY2xpY2soY2IpO1xuXG4gICAgJChpY29uU2hlbGwpXG4gICAgICAgIC5hcHBlbmQoaWNvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVVcG5leHQoKTogdm9pZCB7XG4gICAgJCgneXRkLWNvbXBhY3QtYXV0b3BsYXktcmVuZGVyZXIueXRkLXdhdGNoLW5leHQtc2Vjb25kYXJ5LXJlc3VsdHMtcmVuZGVyZXInKS5yZW1vdmUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFZpZGVvUXVldWVFbGVtZW50KG9iajogSlF1ZXJ5PEVsZW1lbnQ+LCB2aWRlb0lkOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIGJ5bGluZTogc3RyaW5nLCBjY2I6ICgpID0+IHZvaWQsIGRjYjogKCkgPT4gdm9pZCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIGNvbnN0IHBsYXlsaXN0VmlkZW9SZW5kZXJlciA9IGNyZWF0ZVl0UGxheWxpc3RQYW5lbFZpZGVvUmVuZGVyZXIoKTtcbiAgICAkKG9iailcbiAgICAgICAgLmFwcGVuZChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpO1xuXG4gICAgY29uc3QgbWVudVJlbmRlcmVyID0gY3JlYXRlWXRNZW51UmVuZGVyZXIoKTtcbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnZGl2I21lbnUnKVxuICAgICAgICAuYXBwZW5kKG1lbnVSZW5kZXJlcik7XG5cbiAgICAkKG1lbnVSZW5kZXJlcikuZmluZCgneXQtaWNvbi1idXR0b24jYnV0dG9uJylcbiAgICAgICAgLmF0dHIoJ2hpZGRlbicsICcnKTtcblxuICAgIGluamVjdFl0UmVuZGVyZWRCdXR0b24oJChtZW51UmVuZGVyZXIpLmZpbmQoJ2RpdiN0b3AtbGV2ZWwtYnV0dG9ucycpLCBcIlwiLCBudWxsLCBjcmVhdGVUcmFzaEljb24oKSwgZGNiKTtcblxuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdhI3RodW1ibmFpbCA+IHl0LWltZy1zaGFkb3cnKVxuICAgICAgICAuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJywgJ3RyYW5zcGFyZW50JylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdlbXB0eScpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdpbWcjaW1nJylcbiAgICAgICAgICAgIC5hdHRyKCdzcmMnLCBgaHR0cHM6Ly9pLnl0aW1nLmNvbS92aS8ke3ZpZGVvSWR9L2hxZGVmYXVsdC5qcGdgKTtcblxuICAgICAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnYSN0aHVtYm5haWwgPiB5dC1pbWctc2hhZG93JylcbiAgICAgICAgICAgIC5hdHRyKCdsb2FkZWQnKTtcbiAgICB9LCA1MDApO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2Ejd2MtZW5kcG9pbnQnKVxuICAgICAgICAuY2xpY2soY2NiKTtcblxuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdhI3RodW1ibmFpbCcpXG4gICAgICAgIC5jbGljayhjY2IpO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ3NwYW4jdmlkZW8tdGl0bGUnKVxuICAgICAgICAudGV4dCh0aXRsZSk7XG5cbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnc3BhbiNieWxpbmUnKVxuICAgICAgICAudGV4dChieWxpbmUpO1xuXG4gICAgcmV0dXJuIHBsYXlsaXN0VmlkZW9SZW5kZXJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdEVtcHR5UXVldWVTaGVsbCh0aXRsZTogc3RyaW5nLCBjb2xsYXBzaWJsZTogYm9vbGVhbiwgY29sbGFwc2VkOiBib29sZWFuKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgY29uc3QgcmVuZGVyZXIgPSBjcmVhdGVZdFBsYXlsaXN0UGFuZWxSZW5kZXJlcigpO1xuICAgICQoJ2RpdiNzZWNvbmRhcnkgI3BsYXlsaXN0JylcbiAgICAgICAgLnJlcGxhY2VXaXRoKHJlbmRlcmVyKTtcblxuICAgIGlmKCFjb2xsYXBzaWJsZSkge1xuICAgICAgICAkKHJlbmRlcmVyKVxuICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NvbGxhcHNpYmxlJylcbiAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdjb2xsYXBzZWQnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmKCFjb2xsYXBzZWQpIHtcbiAgICAgICAgICAgICQocmVuZGVyZXIpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NvbGxhcHNlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJCgnZGl2I3NlY29uZGFyeSAjcGxheWxpc3QgaDMgeXQtZm9ybWF0dGVkLXN0cmluZycpXG4gICAgICAgIC50ZXh0KHRpdGxlKTtcblxuICAgIHJldHVybiByZW5kZXJlcjtcbn0iXSwic291cmNlUm9vdCI6IiJ9