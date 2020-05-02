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
        this.addVideoToQueue();
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
    sendWsMessage(type, data) {
        const message = {
            action: type,
            data
        };
        this.ws.send(JSON.stringify(message));
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
    populateQueue(videos) {
        this.queueElement.empty();
        videos.forEach((v) => {
            ytHTML.injectVideoQueueElement(this.queueElement, v.videoId, v.title, v.byline, this.queueElementClickHandler(v.videoId), this.queueElementDeleteHandler(v.videoId));
        });
    }
    addVideoToQueue() {
        const params = new URLSearchParams(window.location.search);
        const videoId = params.get('v');
        if (videoId === null)
            return;
        this.sendWsMessage(Message.ADD_TO_QUEUE, {
            videoId,
            title: $('ytd-video-primary-info-renderer h1 yt-formatted-string').text(),
            byline: $('ytd-channel-name a').text()
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
                    this.populateQueue(data);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL2NvbnN0cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zY2hlZHVsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvd2Vic29ja2V0LnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3l0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsRkEsd0ZBQXNFO0FBQ3RFLGtGQUEwQztBQUMxQyx5RUFBK0M7QUFDL0MsZ0dBQXlDO0FBY3pDLElBQUssT0FRSjtBQVJELFdB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QyxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztTQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbEIsT0FBTyxxQkFBcUIsQ0FBQztBQUNqQyxDQUFDO0FBdkNELDBEQXVDQztBQUVELFNBQWdCLHFCQUFxQixDQUFDLEtBQWEsRUFBRSxXQUFvQixFQUFFLFNBQWtCO0lBQ3pGLE1BQU0sUUFBUSxHQUFHLDZCQUE2QixFQUFFLENBQUM7SUFDakQsQ0FBQyxDQUFDLHlCQUF5QixDQUFDO1NBQ3ZCLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUUzQixJQUFHLENBQUMsV0FBVyxFQUFFO1FBQ2IsQ0FBQyxDQUFDLFFBQVEsQ0FBQzthQUNOLFVBQVUsQ0FBQyxhQUFhLENBQUM7YUFDekIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2hDO1NBQ0k7UUFDRCxJQUFHLENBQUMsU0FBUyxFQUFFO1lBQ1gsQ0FBQyxDQUFDLFFBQVEsQ0FBQztpQkFDTixVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDaEM7S0FDSjtJQUVELENBQUMsQ0FBQyxnREFBZ0QsQ0FBQztTQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakIsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQztBQXJCRCxzREFxQkMiLCJmaWxlIjoibGliLnVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9wbHVnaW4udHNcIik7XG4iLCJpbXBvcnQgeyBzdGFydFNlZWtDaGVjaywgc3RhcnRVcmxDaGFuZ2VDaGVjayB9IGZyb20gXCIuL3V0aWwvc2NoZWR1bGVcIjtcbmltcG9ydCB7IFNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvY29uc3RzXCI7XG5pbXBvcnQgeyBjaGFuZ2VRdWVyeVN0cmluZyB9IGZyb20gXCIuL3V0aWwvdXJsXCI7XG5pbXBvcnQgKiBhcyB5dEhUTUwgZnJvbSAnLi91dGlsL3l0LWh0bWwnO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7IGN1Y3U6IGFueTsgfVxufVxuXG5pbnRlcmZhY2UgUGxheWVyT3B0aW9ucyB7XG4gICAgY29ubmVjdGlvbjoge1xuICAgICAgICBwcm90b2NvbDogc3RyaW5nO1xuICAgICAgICBob3N0OiBzdHJpbmc7XG4gICAgICAgIHBvcnQ6IHN0cmluZztcbiAgICB9O1xufVxuXG5lbnVtIE1lc3NhZ2Uge1xuICAgIFBMQVkgPSAncGxheScsXG4gICAgUEFVU0UgPSAncGF1c2UnLFxuICAgIFNFRUsgPSAnc2VlaycsXG4gICAgUExBWV9WSURFTyA9ICdwbGF5LXZpZGVvJyxcbiAgICBBRERfVE9fUVVFVUUgPSBcImFkZC10by1xdWV1ZVwiLFxuICAgIERFTEVURV9GUk9NX1FVRVVFID0gXCJkZWxldGUtZnJvbS1xdWV1ZVwiLFxuICAgIFFVRVVFID0gJ3F1ZXVlJ1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXIge1xuICAgIHByaXZhdGUgeXRQbGF5ZXI6IFlULlBsYXllcjtcbiAgICBwcml2YXRlIHdzOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQ7XG4gICAgcHJpdmF0ZSBvcHRpb25zOiBQbGF5ZXJPcHRpb25zO1xuICAgIHByaXZhdGUgcXVldWVFbGVtZW50OiBKUXVlcnk8RWxlbWVudD47XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQbGF5ZXJPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZSh2aWRlb0lkOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nLCBxdWV1ZUVsZW1lbnQ6IEpRdWVyeTxFbGVtZW50Pikge1xuICAgICAgICB0aGlzLnF1ZXVlRWxlbWVudCA9IHF1ZXVlRWxlbWVudDtcblxuICAgICAgICB0aGlzLnl0UGxheWVyID0gbmV3IHdpbmRvdy5ZVC5QbGF5ZXIoJ3l0ZC1wbGF5ZXInLCB7XG4gICAgICAgICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgdmlkZW9JZCxcbiAgICAgICAgICAgIHBsYXllclZhcnM6IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogXCJyZWRcIixcbiAgICAgICAgICAgICAgICBhdXRvcGxheTogWVQuQXV0b1BsYXkuQXV0b1BsYXlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICAgICBvblJlYWR5OiAoZSkgPT4gdGhpcy5vblJlYWR5KGUsIHNlc3Npb25JZCwgdmlkZW9JZCksXG4gICAgICAgICAgICAgICAgb25TdGF0ZUNoYW5nZTogKGUpID0+IHRoaXMub25TdGF0ZUNoYW5nZShlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuY3VjdSA9IHt9O1xuICAgICAgICB3aW5kb3cuY3VjdS5wbGF5ZXIgPSB0aGlzLnl0UGxheWVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25SZWFkeShfOiBZVC5QbGF5ZXJFdmVudCwgc2Vzc2lvbklkOiBzdHJpbmcsIHZpZGVvSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBzdGFydFNlZWtDaGVjayh0aGlzLnl0UGxheWVyLCAxMDAwLCAoKSA9PiB0aGlzLm9uUGxheWVyU2VlaygpKTtcbiAgICAgICAgc3RhcnRVcmxDaGFuZ2VDaGVjaygxMDAwLCAobywgbikgPT4gdGhpcy5vblVybENoYW5nZShvLCBuKSk7XG5cbiAgICAgICAgdGhpcy5jb25uZWN0V3Moc2Vzc2lvbklkKTtcbiAgICAgICAgdGhpcy5hZGRWaWRlb1RvUXVldWUoKTtcbiAgICAgICAgdGhpcy5zZW5kV3NNZXNzYWdlKE1lc3NhZ2UuUExBWV9WSURFTywgdmlkZW9JZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN0YXRlQ2hhbmdlKGV2ZW50OiBZVC5PblN0YXRlQ2hhbmdlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoKGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIGNhc2Ugd2luZG93LllULlBsYXllclN0YXRlLlBMQVlJTkc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kV3NUaW1lTWVzc2FnZShNZXNzYWdlLlBMQVkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUEFVU0VEOlxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZFdzVGltZU1lc3NhZ2UoTWVzc2FnZS5QQVVTRSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUGxheWVyU2VlaygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zZW5kV3NUaW1lTWVzc2FnZShNZXNzYWdlLlNFRUspO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VuZFdzVGltZU1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UobWVzc2FnZSwgdGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VuZFdzTWVzc2FnZSh0eXBlOiBNZXNzYWdlLCBkYXRhOiBhbnkpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGFjdGlvbjogdHlwZSxcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVXJsQ2hhbmdlKG86IExvY2F0aW9uLCBuOiBMb2NhdGlvbik6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgVVJMIENIQU5HRTogJHtvLmhyZWZ9IC0+ICR7bi5ocmVmfWApO1xuICAgICAgICBjb25zdCBvbGRQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKG8uc2VhcmNoKTtcbiAgICAgICAgY29uc3QgbmV3UGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhuLnNlYXJjaCk7XG5cbiAgICAgICAgY29uc3Qgb2xkU2Vzc2lvbklkID0gb2xkUGFyYW1zLmdldChTZXNzaW9uSWQpO1xuICAgICAgICBjb25zdCBuZXdTZXNzaW9uSWQgPSBuZXdQYXJhbXMuZ2V0KFNlc3Npb25JZCk7XG4gICAgICAgIGlmKG9sZFNlc3Npb25JZCAhPT0gbnVsbCAmJiBuZXdTZXNzaW9uSWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIG5ld1BhcmFtcy5zZXQoU2Vzc2lvbklkLCBvbGRTZXNzaW9uSWQpO1xuICAgICAgICAgICAgLy8gY2hhbmdlUXVlcnlTdHJpbmcobmV3UGFyYW1zLnRvU3RyaW5nKCksIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uc2VhcmNoID0gbmV3UGFyYW1zLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2aWRlb0lkID0gbmV3UGFyYW1zLmdldCgndicpO1xuICAgICAgICBpZih2aWRlb0lkICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5QTEFZX1ZJREVPLCB2aWRlb0lkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMb2FkaW5nIG5ldyBWSURFTzogJHt2aWRlb0lkfWApO1xuICAgICAgICAgICAgdGhpcy55dFBsYXllci5sb2FkVmlkZW9CeUlkKHZpZGVvSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25uZWN0V3Moc2Vzc2lvbklkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBwcm90b2NvbCwgaG9zdCwgcG9ydCB9ID0gdGhpcy5vcHRpb25zLmNvbm5lY3Rpb247XG5cbiAgICAgICAgdGhpcy53cyA9IGlvKGAke3Byb3RvY29sfTovLyR7aG9zdH06JHtwb3J0fS8ke3Nlc3Npb25JZH1gLCB7XG4gICAgICAgICAgICBhdXRvQ29ubmVjdDogdHJ1ZSxcbiAgICAgICAgICAgIHBhdGg6ICcvc29ja2V0LmlvJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53cy5vbignY29ubmVjdCcsICgpID0+IHRoaXMub25Xc0Nvbm5lY3RlZCgpKTtcbiAgICAgICAgdGhpcy53cy5vbignbWVzc2FnZScsIChkOiBzdHJpbmcpID0+IHRoaXMub25Xc01lc3NhZ2UoZCwgdGhpcykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Xc0Nvbm5lY3RlZCgpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDb25uZWN0ZWRcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzeW5jUGxheWVyVGltZSh2aWRlb1RpbWU6IG51bWJlciwgbWFyZ2luOiBudW1iZXIgPSAxLjApOiB2b2lkIHtcbiAgICAgICAgaWYgKE1hdGguYWJzKHZpZGVvVGltZSAtIHRoaXMueXRQbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSkgPiBtYXJnaW4pIHtcbiAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIuc2Vla1RvKHZpZGVvVGltZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHBvcHVsYXRlUXVldWUodmlkZW9zOiB7IHZpZGVvSWQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgYnlsaW5lOiBzdHJpbmcgfVtdKTogdm9pZCB7XG4gICAgICAgIHRoaXMucXVldWVFbGVtZW50LmVtcHR5KCk7XG5cbiAgICAgICAgdmlkZW9zLmZvckVhY2goKHYpID0+IHtcbiAgICAgICAgICAgIHl0SFRNTC5pbmplY3RWaWRlb1F1ZXVlRWxlbWVudCh0aGlzLnF1ZXVlRWxlbWVudCwgdi52aWRlb0lkLCB2LnRpdGxlLCB2LmJ5bGluZSwgdGhpcy5xdWV1ZUVsZW1lbnRDbGlja0hhbmRsZXIodi52aWRlb0lkKSwgdGhpcy5xdWV1ZUVsZW1lbnREZWxldGVIYW5kbGVyKHYudmlkZW9JZCkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFZpZGVvVG9RdWV1ZSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICAgICAgY29uc3QgdmlkZW9JZCA9IHBhcmFtcy5nZXQoJ3YnKTtcblxuICAgICAgICBpZiAodmlkZW9JZCA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5BRERfVE9fUVVFVUUsIHtcbiAgICAgICAgICAgIHZpZGVvSWQsXG4gICAgICAgICAgICB0aXRsZTogJCgneXRkLXZpZGVvLXByaW1hcnktaW5mby1yZW5kZXJlciBoMSB5dC1mb3JtYXR0ZWQtc3RyaW5nJykudGV4dCgpLFxuICAgICAgICAgICAgYnlsaW5lOiAkKCd5dGQtY2hhbm5lbC1uYW1lIGEnKS50ZXh0KClcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBxdWV1ZUVsZW1lbnRDbGlja0hhbmRsZXIodklkOiBzdHJpbmcpOiAoKSA9PiB2b2lkIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlUXVlcnlTdHJpbmdWaWRlb0lkKHZJZCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBxdWV1ZUVsZW1lbnREZWxldGVIYW5kbGVyKHZJZDogc3RyaW5nKTogKCkgPT4gdm9pZCB7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5ERUxFVEVfRlJPTV9RVUVVRSwgdklkKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZVF1ZXJ5U3RyaW5nVmlkZW9JZCh2aWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuICAgICAgICBwYXJhbXMuc2V0KCd2JywgdmlkKTtcbiAgICAgICAgY2hhbmdlUXVlcnlTdHJpbmcocGFyYW1zLnRvU3RyaW5nKCksIHVuZGVmaW5lZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldzTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcsIHBsYXllcjogUGxheWVyKTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShtZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBqc29uLmFjdGlvbjtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBqc29uLmRhdGE7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBNZXNzYWdlOiAke21lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBsYXllclN0YXRlID0gcGxheWVyLnl0UGxheWVyLmdldFBsYXllclN0YXRlKCk7XG5cbiAgICAgICAgICAgIHN3aXRjaChjb21tYW5kKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBMQVkudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnN5bmNQbGF5ZXJUaW1lKHBhcnNlRmxvYXQoZGF0YSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHBsYXllclN0YXRlID09PSBZVC5QbGF5ZXJTdGF0ZS5QQVVTRUQpXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIucGxheVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBBVVNFLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5zeW5jUGxheWVyVGltZShwYXJzZUZsb2F0KGRhdGEpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihwbGF5ZXJTdGF0ZSA9PT0gWVQuUGxheWVyU3RhdGUuUExBWUlORylcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5wYXVzZVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlNFRUsudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnNlZWtUbyhwYXJzZUZsb2F0KGRhdGEpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBMQVlfVklERU8udG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VRdWVyeVN0cmluZ1ZpZGVvSWQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5RVUVVRS50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlUXVldWUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoKGUpIHsgY29uc29sZS5lcnJvcihlKTsgfVxuICAgIH1cblxufSIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgKiBhcyB5dEhUTUwgZnJvbSBcIi4vdXRpbC95dC1odG1sXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZVNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvd2Vic29ja2V0XCI7XG5pbXBvcnQgeyBTZXNzaW9uSWQgfSBmcm9tIFwiLi91dGlsL2NvbnN0c1wiO1xuaW1wb3J0IHsgc3RhcnRVcmxDaGFuZ2VDaGVjayB9IGZyb20gXCIuL3V0aWwvc2NoZWR1bGVcIjtcblxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXG4gICAgY29uc3QgaW50ZXJ2YWxzID0ge1xuICAgICAgICBzeW5jQnV0dG9uOiBudWxsLFxuICAgICAgICBsZWF2ZUJ1dHRvbjogbnVsbCxcbiAgICAgICAgcmVtb3ZlVXBuZXh0OiBudWxsLFxuICAgICAgICBxdWV1ZTogbnVsbFxuICAgIH07XG5cbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgUGxheWVyKHtcbiAgICAgICAgY29ubmVjdGlvbjoge1xuICAgICAgICAgICAgcHJvdG9jb2w6ICdodHRwJyxcbiAgICAgICAgICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxuICAgICAgICAgICAgcG9ydDogJzgwODAnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHZpZGVvSWQgPSB1cmxQYXJhbXMuZ2V0KCd2Jyk7XG4gICAgY29uc3Qgc2Vzc2lvbklkID0gdXJsUGFyYW1zLmdldChTZXNzaW9uSWQpO1xuXG4gICAgaWYgKHNlc3Npb25JZCA9PT0gbnVsbCkge1xuICAgICAgICBpbnRlcnZhbHMuc3luY0J1dHRvbiA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIpKSB7XG4gICAgICAgICAgICAgICAgeXRIVE1MLmluamVjdFl0UmVuZGVyZWRCdXR0b24oJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSwgXCJjcmVhdGUtc3luYy1idXR0b25cIiwgXCJDcmVhdGUgU3luY1wiLCB5dEhUTUwuY3JlYXRlUGx1c0ljb24oKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXMuc2V0KFNlc3Npb25JZCwgZ2VuZXJhdGVTZXNzaW9uSWQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggPSB1cmxQYXJhbXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5zeW5jQnV0dG9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGludGVydmFscy5sZWF2ZUJ1dHRvbiA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIpKSB7XG4gICAgICAgICAgICAgICAgeXRIVE1MLmluamVjdFl0UmVuZGVyZWRCdXR0b24oJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSwgXCJsZWF2ZS1zeW5jLWJ1dHRvblwiLCBcIkxlYXZlIFN5bmNcIiwgeXRIVE1MLmNyZWF0ZUxlYXZlSWNvbigpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHVybFBhcmFtcy5kZWxldGUoU2Vzc2lvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnNlYXJjaCA9IHVybFBhcmFtcy50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxzLmxlYXZlQnV0dG9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICBpbnRlcnZhbHMucmVtb3ZlVXBuZXh0ID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCQoXCJ5dGQtY29tcGFjdC1hdXRvcGxheS1yZW5kZXJlci55dGQtd2F0Y2gtbmV4dC1zZWNvbmRhcnktcmVzdWx0cy1yZW5kZXJlclwiKSkge1xuICAgICAgICAgICAgICAgIHl0SFRNTC5yZW1vdmVVcG5leHQoKTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5yZW1vdmVVcG5leHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCA1MDApO1xuXG4gICAgICAgIGludGVydmFscy5xdWV1ZSA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwiZGl2I3NlY29uZGFyeSAjcGxheWxpc3RcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZW5kZXJlciA9IHl0SFRNTC5pbmplY3RFbXB0eVF1ZXVlU2hlbGwoXCJRdWV1ZVwiLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSByZW5kZXJlci5maW5kKCcjaXRlbXMnKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIuY3JlYXRlKHZpZGVvSWQsIHNlc3Npb25JZCwgaXRlbXMpO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxzLnF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcbiAgICB9XG59OyIsImV4cG9ydCBjb25zdCBTZXNzaW9uSWQgPSAnc3luY0lkJzsiLCJleHBvcnQgY29uc3Qgc3RhcnRTZWVrQ2hlY2sgPSAocGxheWVyOiBZVC5QbGF5ZXIsIGludGVydmFsOiBudW1iZXIsIGNiOiAoKSA9PiB2b2lkKTogKCkgPT4gdm9pZCA9PiB7XG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjkyOTM4NzcvaG93LXRvLWxpc3Rlbi10by1zZWVrLWV2ZW50LWluLXlvdXR1YmUtZW1iZWQtYXBpXG4gICAgbGV0IGxhc3RUaW1lID0gLTE7XG5cbiAgICBjb25zdCBjaGVja1BsYXllclRpbWUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChsYXN0VGltZSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGlmKHBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpID09PSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUExBWUlORyApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lID0gcGxheWVyLmdldEN1cnJlbnRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBleHBlY3RpbmcgMSBzZWNvbmQgaW50ZXJ2YWwgLCB3aXRoIDUwMCBtcyBtYXJnaW5cbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnModGltZSAtIGxhc3RUaW1lIC0gMSkgPiAwLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlcmUgd2FzIGEgc2VlayBvY2N1cmluZ1xuICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsYXN0VGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVyID0gc2V0SW50ZXJ2YWwoY2hlY2tQbGF5ZXJUaW1lLCBpbnRlcnZhbCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgIH07XG59O1xuXG5cbmV4cG9ydCBjb25zdCBzdGFydFVybENoYW5nZUNoZWNrID0gKGludGVydmFsOiBudW1iZXIsIGNiOiAobzogTG9jYXRpb24sIG46IExvY2F0aW9uKSA9PiB2b2lkKTogKCkgPT4gdm9pZCA9PiB7XG4gICAgbGV0IG9sZDogTG9jYXRpb24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHdpbmRvdy5sb2NhdGlvbikpO1xuICAgIGNvbnN0IGNoZWNrVVJMID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gd2luZG93LmxvY2F0aW9uO1xuXG4gICAgICAgIGlmKG9sZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgb2xkID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjdXJyZW50KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2xkLmhyZWYgIT09IGN1cnJlbnQuaHJlZikge1xuICAgICAgICAgICAgY2Iob2xkLCBjdXJyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9sZCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY3VycmVudCkpO1xuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVyID0gc2V0SW50ZXJ2YWwoY2hlY2tVUkwsIGludGVydmFsKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgfTtcbn07IiwiZXhwb3J0IGZ1bmN0aW9uIGNoYW5nZVF1ZXJ5U3RyaW5nKHNlYXJjaFN0cmluZywgZG9jdW1lbnRUaXRsZSkge1xuICAgIGRvY3VtZW50VGl0bGUgPSB0eXBlb2YgZG9jdW1lbnRUaXRsZSAhPT0gJ3VuZGVmaW5lZCcgPyBkb2N1bWVudFRpdGxlIDogZG9jdW1lbnQudGl0bGU7XG4gICAgY29uc3QgdXJsU3BsaXQgPSAod2luZG93LmxvY2F0aW9uLmhyZWYpLnNwbGl0KFwiP1wiKTtcbiAgICBjb25zdCBvYmogPSB7XG4gICAgICAgIFRpdGxlOiBkb2N1bWVudFRpdGxlLFxuICAgICAgICBVcmw6IHVybFNwbGl0WzBdICsgJz8nICsgc2VhcmNoU3RyaW5nXG4gICAgfTtcblxuICAgIGhpc3RvcnkucHVzaFN0YXRlKG9iaiwgb2JqLlRpdGxlLCBvYmouVXJsKTtcbn0iLCJleHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSk7XG59IiwiZnVuY3Rpb24gY3JlYXRlU3ZnKGQ6IHN0cmluZyk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHN2Z1xuICAgICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pZFlNaWQgbWVldFwiXG4gICAgICAgICAgICBmb2N1c2FibGU9XCJmYWxzZVwiXG4gICAgICAgICAgICBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIlxuICAgICAgICAgICAgc3R5bGU9XCJwb2ludGVyLWV2ZW50czogbm9uZTsgZGlzcGxheTogYmxvY2s7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7XCJcbiAgICAgICAgPlxuICAgICAgICAgICAgPGcgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD1cIiR7ZH1cIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIiAvPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICA8L3N2Zz5cbiAgICBgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBsdXNJY29uKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiBjcmVhdGVTdmcoXCJNMTkgMTNoLTZ2NmgtMnYtNkg1di0yaDZWNWgydjZoNnYyelwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxlYXZlSWNvbigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gY3JlYXRlU3ZnKFwiTTEwLjA5IDE1LjU5TDExLjUgMTdsNS01LTUtNS0xLjQxIDEuNDFMMTIuNjcgMTFIM3YyaDkuNjdsLTIuNTggMi41OXpNMTkgM0g1Yy0xLjExIDAtMiAuOS0yIDJ2NGgyVjVoMTR2MTRINXYtNEgzdjRjMCAxLjEuODkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMS0uOS0yLTItMnpcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFzaEljb24oKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuIGNyZWF0ZVN2ZyhcIk02IDE5YzAgMS4xLjkgMiAyIDJoOGMxLjEgMCAyLS45IDItMlY3SDZ2MTJ6TTE5IDRoLTMuNWwtMS0xaC01bC0xIDFINXYyaDE0VjR6XCIpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEljb25TaGVsbCgpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWljb24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIgLz5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uQnV0dG9uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uLWJ1dHRvbiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiBpZD1cImJ1dHRvblwiPmApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEZvcm1hdHRlZFN0cmluZyhjYjogKCkgPT4gdm9pZCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtZm9ybWF0dGVkLXN0cmluZyBpZD1cInRleHRcIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiAvPmApXG4gICAgICAgIC5jbGljayhjYik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0U2ltcGxlRW5kcG9pbnQoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8YSBjbGFzcz1cInl0LXNpbXBsZS1lbmRwb2ludCBzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIgdGFiaW5kZXg9XCItMVwiPlxuICAgIGApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEljb25CdXR0b25SZW5kZXJlcihpZDogc3RyaW5nLCBoYXNUZXh0OiBib29sZWFuKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8eXRkLWJ1dHRvbi1yZW5kZXJlclxuICAgICAgICAgICAgaWQ9XCIke2lkfVwiXG4gICAgICAgICAgICBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1tZW51LXJlbmRlcmVyIGZvcmNlLWljb24tYnV0dG9uIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCJcbiAgICAgICAgICAgIGJ1dHRvbi1yZW5kZXJlcj1cIlwiXG4gICAgICAgICAgICB1c2Uta2V5Ym9hcmQtZm9jdXNlZD1cIlwiXG4gICAgICAgICAgICBpcy1pY29uLWJ1dHRvbj1cIlwiXG4gICAgICAgICAgICAkeyFoYXNUZXh0ID8gXCJoYXMtbm8tdGV4dFwiIDogXCJcIn1cbiAgICAgICAgLz5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRNZW51UmVuZGVyZXIoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8eXRkLW1lbnUtcmVuZGVyZXIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtcGxheWxpc3QtcGFuZWwtdmlkZW8tcmVuZGVyZXJcIj5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRQbGF5bGlzdFBhbmVsVmlkZW9SZW5kZXJlcigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDx5dGQtcGxheWxpc3QtcGFuZWwtdmlkZW8tcmVuZGVyZXJcbiAgICAgICAgICAgIGlkPVwicGxheWxpc3QtaXRlbXNcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtcGxheWxpc3QtcGFuZWwtcmVuZGVyZXJcIlxuICAgICAgICAgICAgbG9ja3VwPVwiXCJcbiAgICAgICAgICAgIHdhdGNoLWNvbG9yLXVwZGF0ZV89XCJcIlxuICAgICAgICAgICAgY2FuLXJlb3JkZXI9XCJcIlxuICAgICAgICAgICAgdG91Y2gtcGVyc2lzdGVudC1kcmFnLWhhbmRsZT1cIlwiXG4gICAgICAgIC8+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0UGxheWxpc3RQYW5lbFJlbmRlcmVyKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1wbGF5bGlzdC1wYW5lbC1yZW5kZXJlclxuICAgICAgICAgICAgaWQ9XCJwbGF5bGlzdFwiXG4gICAgICAgICAgICBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC13YXRjaC1mbGV4eVwiXG4gICAgICAgICAgICBqcy1wYW5lbC1oZWlnaHRfPVwiXCJcbiAgICAgICAgICAgIGhhcy1wbGF5bGlzdC1idXR0b25zPVwiXCJcbiAgICAgICAgICAgIGhhcy10b29sYmFyXz1cIlwiXG4gICAgICAgICAgICBwbGF5bGlzdC10eXBlXz1cIlRMUFFcIixcbiAgICAgICAgICAgIGNvbGxhcHNpYmxlPVwiXCJcbiAgICAgICAgICAgIGNvbGxhcHNlZD1cIlwiXG4gICAgICAgIC8+XG4gICAgYCk7XG59XG5cbi8qKlxuICogSW5qZWN0IGEgWXRSZW5kZXJlZEJ1dHRvbiBpbnRvIGFuIG9iamVjdFxuICpcbiAqIEBwYXJhbSBvYmpJZCBUaGUgSWQgb2YgdGhlIG9iamVjdCB0aGUgWXRSZW5kZXJlZEJ1dHRvbiBzaG91bGQgYmUgaW5qZWN0ZWQgdG9cbiAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IG9mIHRoZSBidXR0b25cbiAqIEBwYXJhbSBpY29uIFRoZSBpY29uIG9mIHRoZSBidXR0b24gKG5lZWRzIHRvIGJlIGEgc3ZnIEVsZW1lbnQpXG4gKiBAcGFyYW0gY2IgVGhlIGZ1bmN0aW9uIHRoYXQgc2hvdWxkIGJlIGNhbGxlZCBvbiBidXR0b24gY2xpY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFl0UmVuZGVyZWRCdXR0b24ob2JqSWQ6IEpRdWVyeTxFbGVtZW50PiwgY29udGFpbmVySWQ6IHN0cmluZywgdGV4dDogc3RyaW5nIHwgbnVsbCwgaWNvbjogSlF1ZXJ5PEhUTUxFbGVtZW50PiwgY2I6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICAvLyBUaGUgY29tcGxldGUgYnV0dG9uIG5lZWRzIHRvIGJlIGluamVjdGVkIGV4YWN0bHkgbGlrZSB0aGlzXG4gICAgLy8gYmVjYXVzZSB3aGVuIHdlIGluamVjdCB0aGUgY29tcGxldGVseSBidWlsZCBidXR0b25cbiAgICAvLyBZVCByZW1vdmVzIGFsbCBpdHMgY29udGVudCBzbyB3ZSBuZWVkIHRvIHBhcnRpYWxseSBpbmplY3RcbiAgICAvLyBldmVyeXRoaW5nIGluIG9yZGVyIHRvIGdldCBpdCB0byB3b3JrXG4gICAgY29uc3QgaGFzVGV4dCA9IHRleHQgIT09IFwiXCIgJiYgdGV4dCAhPT0gbnVsbDtcblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGNyZWF0ZVl0SWNvbkJ1dHRvblJlbmRlcmVyKGNvbnRhaW5lcklkLCBoYXNUZXh0KTtcbiAgICAkKG9iaklkKVxuICAgICAgICAuYXBwZW5kKGNvbnRhaW5lcik7XG5cbiAgICBjb25zdCBhID0gY3JlYXRlWXRTaW1wbGVFbmRwb2ludCgpO1xuICAgICQoY29udGFpbmVyKVxuICAgICAgICAuYXBwZW5kKGEpO1xuXG4gICAgY29uc3QgaWNvbkJ1dHRvbiA9IGNyZWF0ZVl0SWNvbkJ1dHRvblNoZWxsKCk7XG5cbiAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBoYXNUZXh0ID8gY3JlYXRlWXRGb3JtYXR0ZWRTdHJpbmcoY2IpIDogbnVsbDtcbiAgICAkKGEpXG4gICAgICAgIC5hcHBlbmQoaWNvbkJ1dHRvbilcbiAgICAgICAgLmFwcGVuZChmb3JtYXR0ZWRTdHJpbmcpO1xuXG4gICAgaWYgKGhhc1RleHQpIHtcbiAgICAgICAgJChmb3JtYXR0ZWRTdHJpbmcpXG4gICAgICAgICAgICAudGV4dCh0ZXh0KTtcbiAgICB9XG5cbiAgICBjb25zdCBpY29uU2hlbGwgPSBjcmVhdGVZdEljb25TaGVsbCgpO1xuICAgICQoaWNvbkJ1dHRvbikuZmluZChcImJ1dHRvbiNidXR0b25cIilcbiAgICAgICAgLmFwcGVuZChpY29uU2hlbGwpXG4gICAgICAgIC5jbGljayhjYik7XG5cbiAgICAkKGljb25TaGVsbClcbiAgICAgICAgLmFwcGVuZChpY29uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVVwbmV4dCgpOiB2b2lkIHtcbiAgICAkKCd5dGQtY29tcGFjdC1hdXRvcGxheS1yZW5kZXJlci55dGQtd2F0Y2gtbmV4dC1zZWNvbmRhcnktcmVzdWx0cy1yZW5kZXJlcicpLnJlbW92ZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0VmlkZW9RdWV1ZUVsZW1lbnQob2JqOiBKUXVlcnk8RWxlbWVudD4sIHZpZGVvSWQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgYnlsaW5lOiBzdHJpbmcsIGNjYjogKCkgPT4gdm9pZCwgZGNiOiAoKSA9PiB2b2lkKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgY29uc3QgcGxheWxpc3RWaWRlb1JlbmRlcmVyID0gY3JlYXRlWXRQbGF5bGlzdFBhbmVsVmlkZW9SZW5kZXJlcigpO1xuICAgICQob2JqKVxuICAgICAgICAuYXBwZW5kKHBsYXlsaXN0VmlkZW9SZW5kZXJlcik7XG5cbiAgICBjb25zdCBtZW51UmVuZGVyZXIgPSBjcmVhdGVZdE1lbnVSZW5kZXJlcigpO1xuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdkaXYjbWVudScpXG4gICAgICAgIC5hcHBlbmQobWVudVJlbmRlcmVyKTtcblxuICAgICQobWVudVJlbmRlcmVyKS5maW5kKCd5dC1pY29uLWJ1dHRvbiNidXR0b24nKVxuICAgICAgICAuYXR0cignaGlkZGVuJywgJycpO1xuXG4gICAgaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbigkKG1lbnVSZW5kZXJlcikuZmluZCgnZGl2I3RvcC1sZXZlbC1idXR0b25zJyksIFwiXCIsIG51bGwsIGNyZWF0ZVRyYXNoSWNvbigpLCBkY2IpO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2EjdGh1bWJuYWlsID4geXQtaW1nLXNoYWRvdycpXG4gICAgICAgIC5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAndHJhbnNwYXJlbnQnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2VtcHR5Jyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2ltZyNpbWcnKVxuICAgICAgICAgICAgLmF0dHIoJ3NyYycsIGBodHRwczovL2kueXRpbWcuY29tL3ZpLyR7dmlkZW9JZH0vaHFkZWZhdWx0LmpwZ2ApO1xuXG4gICAgICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdhI3RodW1ibmFpbCA+IHl0LWltZy1zaGFkb3cnKVxuICAgICAgICAgICAgLmF0dHIoJ2xvYWRlZCcpO1xuICAgIH0sIDUwMCk7XG5cbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnYSN3Yy1lbmRwb2ludCcpXG4gICAgICAgIC5jbGljayhjY2IpO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2EjdGh1bWJuYWlsJylcbiAgICAgICAgLmNsaWNrKGNjYik7XG5cbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnc3BhbiN2aWRlby10aXRsZScpXG4gICAgICAgIC50ZXh0KHRpdGxlKTtcblxuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdzcGFuI2J5bGluZScpXG4gICAgICAgIC50ZXh0KGJ5bGluZSk7XG5cbiAgICByZXR1cm4gcGxheWxpc3RWaWRlb1JlbmRlcmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0RW1wdHlRdWV1ZVNoZWxsKHRpdGxlOiBzdHJpbmcsIGNvbGxhcHNpYmxlOiBib29sZWFuLCBjb2xsYXBzZWQ6IGJvb2xlYW4pOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICBjb25zdCByZW5kZXJlciA9IGNyZWF0ZVl0UGxheWxpc3RQYW5lbFJlbmRlcmVyKCk7XG4gICAgJCgnZGl2I3NlY29uZGFyeSAjcGxheWxpc3QnKVxuICAgICAgICAucmVwbGFjZVdpdGgocmVuZGVyZXIpO1xuXG4gICAgaWYoIWNvbGxhcHNpYmxlKSB7XG4gICAgICAgICQocmVuZGVyZXIpXG4gICAgICAgICAgICAucmVtb3ZlQXR0cignY29sbGFwc2libGUnKVxuICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NvbGxhcHNlZCcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYoIWNvbGxhcHNlZCkge1xuICAgICAgICAgICAgJChyZW5kZXJlcilcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignY29sbGFwc2VkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkKCdkaXYjc2Vjb25kYXJ5ICNwbGF5bGlzdCBoMyB5dC1mb3JtYXR0ZWQtc3RyaW5nJylcbiAgICAgICAgLnRleHQodGl0bGUpO1xuXG4gICAgcmV0dXJuIHJlbmRlcmVyO1xufSJdLCJzb3VyY2VSb290IjoiIn0=