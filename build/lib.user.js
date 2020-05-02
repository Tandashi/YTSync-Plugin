// ==UserScript==
// @name         YT Sync
// @namespace    https://tandashi.de
// @version      0.1
// @description  try to take over the world!
// @author       Tandashi
// @match        https://www.youtube.com/*
//
// @grant       GM_setValue
// @grant       GM_getValue
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
const video_1 = __webpack_require__(/*! ./util/video */ "./src/util/video.ts");
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
        this.ytPlayer = new unsafeWindow.YT.Player('ytd-player', {
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
        schedule_1.startQueueAddChecker(1000, (v) => this.addVideoToQueue(v));
        this.connectWs(sessionId);
        this.addVideoToQueue(video_1.getCurrentVideo());
        this.sendWsMessage(Message.PLAY_VIDEO, videoId);
    }
    onStateChange(event) {
        switch (event.data) {
            case unsafeWindow.YT.PlayerState.PLAYING:
                this.sendWsTimeMessage(Message.PLAY);
                break;
            case unsafeWindow.YT.PlayerState.PAUSED:
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
    addVideoToQueue(video) {
        this.sendWsMessage(Message.ADD_TO_QUEUE, video);
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
                    if (playerState === unsafeWindow.YT.PlayerState.PAUSED)
                        player.ytPlayer.playVideo();
                    break;
                case Message.PAUSE.toString():
                    player.syncPlayerTime(parseFloat(data));
                    if (playerState === unsafeWindow.YT.PlayerState.PLAYING)
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
const store_1 = __importDefault(__webpack_require__(/*! ./util/store */ "./src/util/store.ts"));
const video_1 = __webpack_require__(/*! ./util/video */ "./src/util/video.ts");
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const intervals = {
        syncButton: null,
        leaveButton: null,
        removeUpnext: null,
        queueInject: null,
        queueAddButton: null
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
        intervals.queueAddButton = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                ytHTML.injectYtRenderedButton($("div#info ytd-menu-renderer div#top-level-buttons"), "queue-add-button", "Add to Queue", ytHTML.createPlusIcon(), () => {
                    store_1.default.addElement(video_1.getCurrentVideo());
                });
                clearInterval(intervals.queueAddButton);
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
        intervals.queueInject = setInterval(() => {
            if ($("div#secondary #playlist")) {
                const renderer = ytHTML.injectEmptyQueueShell("Queue", false, true);
                const items = renderer.find('#items');
                player.create(videoId, sessionId, items);
                clearInterval(intervals.queueInject);
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
exports.QueueId = "Queue";


/***/ }),

/***/ "./src/util/schedule.ts":
/*!******************************!*\
  !*** ./src/util/schedule.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(__webpack_require__(/*! ./store */ "./src/util/store.ts"));
exports.startSeekCheck = (player, interval, cb) => {
    // https://stackoverflow.com/questions/29293877/how-to-listen-to-seek-event-in-youtube-embed-api
    let lastTime = -1;
    const checkPlayerTime = () => {
        if (lastTime !== -1) {
            if (player.getPlayerState() === unsafeWindow.YT.PlayerState.PLAYING) {
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
exports.startQueueAddChecker = (interval, cb) => {
    const checkQueue = () => {
        const data = store_1.default.getQueue();
        for (const vobj of data) {
            cb(vobj);
            store_1.default.removeElement(vobj);
        }
    };
    const handler = setInterval(checkQueue, interval);
    return () => {
        clearTimeout(handler);
    };
};


/***/ }),

/***/ "./src/util/store.ts":
/*!***************************!*\
  !*** ./src/util/store.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = __webpack_require__(/*! ./consts */ "./src/util/consts.ts");
class Store {
    static getQueue() {
        const json = GM_getValue(consts_1.QueueId, "[]");
        return JSON.parse(json);
    }
    static addElement(video) {
        const data = Store.getQueue();
        data.push(video);
        Store.setQueue(data);
    }
    static removeElement(video) {
        const data = Store.getQueue().filter((v) => v.videoId !== video.videoId);
        Store.setQueue(data);
    }
    static setQueue(data) {
        GM_setValue(consts_1.QueueId, JSON.stringify(data));
    }
}
exports.default = Store;


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

/***/ "./src/util/video.ts":
/*!***************************!*\
  !*** ./src/util/video.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function getCurrentVideo() {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');
    if (videoId === null)
        return;
    return {
        videoId,
        title: $('ytd-video-primary-info-renderer h1 yt-formatted-string').text(),
        byline: $('ytd-channel-name a').text()
    };
}
exports.getCurrentVideo = getCurrentVideo;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL2NvbnN0cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zY2hlZHVsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zdG9yZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvdmlkZW8udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvd2Vic29ja2V0LnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3l0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2xGQSx3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QixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztTQUN2QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFaEIsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1NBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVqQixDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1NBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVsQixPQUFPLHFCQUFxQixDQUFDO0FBQ2pDLENBQUM7QUF2Q0QsMERBdUNDO0FBRUQsU0FBZ0IscUJBQXFCLENBQUMsS0FBYSxFQUFFLFdBQW9CLEVBQUUsU0FBa0I7SUFDekYsTUFBTSxRQUFRLEdBQUcsNkJBQTZCLEVBQUUsQ0FBQztJQUNqRCxDQUFDLENBQUMseUJBQXlCLENBQUM7U0FDdkIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTNCLElBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDYixDQUFDLENBQUMsUUFBUSxDQUFDO2FBQ04sVUFBVSxDQUFDLGFBQWEsQ0FBQzthQUN6QixVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDaEM7U0FDSTtRQUNELElBQUcsQ0FBQyxTQUFTLEVBQUU7WUFDWCxDQUFDLENBQUMsUUFBUSxDQUFDO2lCQUNOLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNoQztLQUNKO0lBRUQsQ0FBQyxDQUFDLGdEQUFnRCxDQUFDO1NBQzlDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVqQixPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDO0FBckJELHNEQXFCQyIsImZpbGUiOiJsaWIudXNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3BsdWdpbi50c1wiKTtcbiIsImltcG9ydCB7IHN0YXJ0U2Vla0NoZWNrLCBzdGFydFVybENoYW5nZUNoZWNrLCBzdGFydFF1ZXVlQWRkQ2hlY2tlciB9IGZyb20gXCIuL3V0aWwvc2NoZWR1bGVcIjtcbmltcG9ydCB7IFNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvY29uc3RzXCI7XG5pbXBvcnQgeyBjaGFuZ2VRdWVyeVN0cmluZyB9IGZyb20gXCIuL3V0aWwvdXJsXCI7XG5pbXBvcnQgKiBhcyB5dEhUTUwgZnJvbSAnLi91dGlsL3l0LWh0bWwnO1xuaW1wb3J0IHsgZ2V0Q3VycmVudFZpZGVvIH0gZnJvbSBcIi4vdXRpbC92aWRlb1wiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgICAgIGN1Y3U6IGFueTtcbiAgICAgICAgWVQ6IGFueTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBQbGF5ZXJPcHRpb25zIHtcbiAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgICAgIGhvc3Q6IHN0cmluZztcbiAgICAgICAgcG9ydDogc3RyaW5nO1xuICAgIH07XG59XG5cbmVudW0gTWVzc2FnZSB7XG4gICAgUExBWSA9ICdwbGF5JyxcbiAgICBQQVVTRSA9ICdwYXVzZScsXG4gICAgU0VFSyA9ICdzZWVrJyxcbiAgICBQTEFZX1ZJREVPID0gJ3BsYXktdmlkZW8nLFxuICAgIEFERF9UT19RVUVVRSA9IFwiYWRkLXRvLXF1ZXVlXCIsXG4gICAgREVMRVRFX0ZST01fUVVFVUUgPSBcImRlbGV0ZS1mcm9tLXF1ZXVlXCIsXG4gICAgUVVFVUUgPSAncXVldWUnXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XG4gICAgcHJpdmF0ZSB5dFBsYXllcjogWVQuUGxheWVyO1xuICAgIHByaXZhdGUgd3M6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcbiAgICBwcml2YXRlIG9wdGlvbnM6IFBsYXllck9wdGlvbnM7XG4gICAgcHJpdmF0ZSBxdWV1ZUVsZW1lbnQ6IEpRdWVyeTxFbGVtZW50PjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFBsYXllck9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlKHZpZGVvSWQ6IHN0cmluZywgc2Vzc2lvbklkOiBzdHJpbmcsIHF1ZXVlRWxlbWVudDogSlF1ZXJ5PEVsZW1lbnQ+KSB7XG4gICAgICAgIHRoaXMucXVldWVFbGVtZW50ID0gcXVldWVFbGVtZW50O1xuXG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgdW5zYWZlV2luZG93LllULlBsYXllcigneXRkLXBsYXllcicsIHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICB2aWRlb0lkLFxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xuICAgICAgICAgICAgICAgIGNvbG9yOiBcInJlZFwiLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBZVC5BdXRvUGxheS5BdXRvUGxheVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIG9uUmVhZHk6IChlKSA9PiB0aGlzLm9uUmVhZHkoZSwgc2Vzc2lvbklkLCB2aWRlb0lkKSxcbiAgICAgICAgICAgICAgICBvblN0YXRlQ2hhbmdlOiAoZSkgPT4gdGhpcy5vblN0YXRlQ2hhbmdlKGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5jdWN1ID0ge307XG4gICAgICAgIHdpbmRvdy5jdWN1LnBsYXllciA9IHRoaXMueXRQbGF5ZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlYWR5KF86IFlULlBsYXllckV2ZW50LCBzZXNzaW9uSWQ6IHN0cmluZywgdmlkZW9JZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHN0YXJ0U2Vla0NoZWNrKHRoaXMueXRQbGF5ZXIsIDEwMDAsICgpID0+IHRoaXMub25QbGF5ZXJTZWVrKCkpO1xuICAgICAgICBzdGFydFVybENoYW5nZUNoZWNrKDEwMDAsIChvLCBuKSA9PiB0aGlzLm9uVXJsQ2hhbmdlKG8sIG4pKTtcbiAgICAgICAgc3RhcnRRdWV1ZUFkZENoZWNrZXIoMTAwMCwgKHYpID0+IHRoaXMuYWRkVmlkZW9Ub1F1ZXVlKHYpKTtcblxuICAgICAgICB0aGlzLmNvbm5lY3RXcyhzZXNzaW9uSWQpO1xuICAgICAgICB0aGlzLmFkZFZpZGVvVG9RdWV1ZShnZXRDdXJyZW50VmlkZW8oKSk7XG4gICAgICAgIHRoaXMuc2VuZFdzTWVzc2FnZShNZXNzYWdlLlBMQVlfVklERU8sIHZpZGVvSWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TdGF0ZUNoYW5nZShldmVudDogWVQuT25TdGF0ZUNoYW5nZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIHN3aXRjaChldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBjYXNlIHVuc2FmZVdpbmRvdy5ZVC5QbGF5ZXJTdGF0ZS5QTEFZSU5HOlxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZFdzVGltZU1lc3NhZ2UoTWVzc2FnZS5QTEFZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdW5zYWZlV2luZG93LllULlBsYXllclN0YXRlLlBBVVNFRDpcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRXc1RpbWVNZXNzYWdlKE1lc3NhZ2UuUEFVU0UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblBsYXllclNlZWsoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2VuZFdzVGltZU1lc3NhZ2UoTWVzc2FnZS5TRUVLKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbmRXc1RpbWVNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5zZW5kV3NNZXNzYWdlKG1lc3NhZ2UsIHRoaXMueXRQbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKS50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbmRXc01lc3NhZ2UodHlwZTogTWVzc2FnZSwgZGF0YTogYW55KSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBhY3Rpb246IHR5cGUsXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblVybENoYW5nZShvOiBMb2NhdGlvbiwgbjogTG9jYXRpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVSTCBDSEFOR0U6ICR7by5ocmVmfSAtPiAke24uaHJlZn1gKTtcbiAgICAgICAgY29uc3Qgb2xkUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhvLnNlYXJjaCk7XG4gICAgICAgIGNvbnN0IG5ld1BhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobi5zZWFyY2gpO1xuXG4gICAgICAgIGNvbnN0IG9sZFNlc3Npb25JZCA9IG9sZFBhcmFtcy5nZXQoU2Vzc2lvbklkKTtcbiAgICAgICAgY29uc3QgbmV3U2Vzc2lvbklkID0gbmV3UGFyYW1zLmdldChTZXNzaW9uSWQpO1xuICAgICAgICBpZihvbGRTZXNzaW9uSWQgIT09IG51bGwgJiYgbmV3U2Vzc2lvbklkID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBuZXdQYXJhbXMuc2V0KFNlc3Npb25JZCwgb2xkU2Vzc2lvbklkKTtcbiAgICAgICAgICAgIC8vIGNoYW5nZVF1ZXJ5U3RyaW5nKG5ld1BhcmFtcy50b1N0cmluZygpLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnNlYXJjaCA9IG5ld1BhcmFtcy50b1N0cmluZygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmlkZW9JZCA9IG5ld1BhcmFtcy5nZXQoJ3YnKTtcbiAgICAgICAgaWYodmlkZW9JZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zZW5kV3NNZXNzYWdlKE1lc3NhZ2UuUExBWV9WSURFTywgdmlkZW9JZCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTG9hZGluZyBuZXcgVklERU86ICR7dmlkZW9JZH1gKTtcbiAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIubG9hZFZpZGVvQnlJZCh2aWRlb0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY29ubmVjdFdzKHNlc3Npb25JZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHsgcHJvdG9jb2wsIGhvc3QsIHBvcnQgfSA9IHRoaXMub3B0aW9ucy5jb25uZWN0aW9uO1xuXG4gICAgICAgIHRoaXMud3MgPSBpbyhgJHtwcm90b2NvbH06Ly8ke2hvc3R9OiR7cG9ydH0vJHtzZXNzaW9uSWR9YCwge1xuICAgICAgICAgICAgYXV0b0Nvbm5lY3Q6IHRydWUsXG4gICAgICAgICAgICBwYXRoOiAnL3NvY2tldC5pbydcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud3Mub24oJ2Nvbm5lY3QnLCAoKSA9PiB0aGlzLm9uV3NDb25uZWN0ZWQoKSk7XG4gICAgICAgIHRoaXMud3Mub24oJ21lc3NhZ2UnLCAoZDogc3RyaW5nKSA9PiB0aGlzLm9uV3NNZXNzYWdlKGQsIHRoaXMpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uV3NDb25uZWN0ZWQoKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ29ubmVjdGVkXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3luY1BsYXllclRpbWUodmlkZW9UaW1lOiBudW1iZXIsIG1hcmdpbjogbnVtYmVyID0gMS4wKTogdm9pZCB7XG4gICAgICAgIGlmIChNYXRoLmFicyh2aWRlb1RpbWUgLSB0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkpID4gbWFyZ2luKSB7XG4gICAgICAgICAgICB0aGlzLnl0UGxheWVyLnNlZWtUbyh2aWRlb1RpbWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwb3B1bGF0ZVF1ZXVlKHZpZGVvczogeyB2aWRlb0lkOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIGJ5bGluZTogc3RyaW5nIH1bXSk6IHZvaWQge1xuICAgICAgICB0aGlzLnF1ZXVlRWxlbWVudC5lbXB0eSgpO1xuXG4gICAgICAgIHZpZGVvcy5mb3JFYWNoKCh2KSA9PiB7XG4gICAgICAgICAgICB5dEhUTUwuaW5qZWN0VmlkZW9RdWV1ZUVsZW1lbnQodGhpcy5xdWV1ZUVsZW1lbnQsIHYudmlkZW9JZCwgdi50aXRsZSwgdi5ieWxpbmUsIHRoaXMucXVldWVFbGVtZW50Q2xpY2tIYW5kbGVyKHYudmlkZW9JZCksIHRoaXMucXVldWVFbGVtZW50RGVsZXRlSGFuZGxlcih2LnZpZGVvSWQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRWaWRlb1RvUXVldWUodmlkZW86IFZpZGVvKSB7XG4gICAgICAgIHRoaXMuc2VuZFdzTWVzc2FnZShNZXNzYWdlLkFERF9UT19RVUVVRSwgdmlkZW8pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcXVldWVFbGVtZW50Q2xpY2tIYW5kbGVyKHZJZDogc3RyaW5nKTogKCkgPT4gdm9pZCB7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZVF1ZXJ5U3RyaW5nVmlkZW9JZCh2SWQpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgcXVldWVFbGVtZW50RGVsZXRlSGFuZGxlcih2SWQ6IHN0cmluZyk6ICgpID0+IHZvaWQge1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZW5kV3NNZXNzYWdlKE1lc3NhZ2UuREVMRVRFX0ZST01fUVVFVUUsIHZJZCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VRdWVyeVN0cmluZ1ZpZGVvSWQodmlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICAgICAgcGFyYW1zLnNldCgndicsIHZpZCk7XG4gICAgICAgIGNoYW5nZVF1ZXJ5U3RyaW5nKHBhcmFtcy50b1N0cmluZygpLCB1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Xc01lc3NhZ2UobWVzc2FnZTogc3RyaW5nLCBwbGF5ZXI6IFBsYXllcik6IHZvaWQge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UobWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zdCBjb21tYW5kID0ganNvbi5hY3Rpb247XG4gICAgICAgICAgICBjb25zdCBkYXRhID0ganNvbi5kYXRhO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTWVzc2FnZTogJHttZXNzYWdlfWApO1xuXG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJTdGF0ZSA9IHBsYXllci55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpO1xuXG4gICAgICAgICAgICBzd2l0Y2goY29tbWFuZCkge1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5QTEFZLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5zeW5jUGxheWVyVGltZShwYXJzZUZsb2F0KGRhdGEpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihwbGF5ZXJTdGF0ZSA9PT0gdW5zYWZlV2luZG93LllULlBsYXllclN0YXRlLlBBVVNFRClcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5wbGF5VmlkZW8oKTtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2UuUEFVU0UudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnN5bmNQbGF5ZXJUaW1lKHBhcnNlRmxvYXQoZGF0YSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHBsYXllclN0YXRlID09PSB1bnNhZmVXaW5kb3cuWVQuUGxheWVyU3RhdGUuUExBWUlORylcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5wYXVzZVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlNFRUsudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnNlZWtUbyhwYXJzZUZsb2F0KGRhdGEpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBMQVlfVklERU8udG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VRdWVyeVN0cmluZ1ZpZGVvSWQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5RVUVVRS50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlUXVldWUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoKGUpIHsgY29uc29sZS5lcnJvcihlKTsgfVxuICAgIH1cblxufSIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgKiBhcyB5dEhUTUwgZnJvbSBcIi4vdXRpbC95dC1odG1sXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZVNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvd2Vic29ja2V0XCI7XG5pbXBvcnQgeyBTZXNzaW9uSWQgfSBmcm9tIFwiLi91dGlsL2NvbnN0c1wiO1xuaW1wb3J0IHsgc3RhcnRVcmxDaGFuZ2VDaGVjayB9IGZyb20gXCIuL3V0aWwvc2NoZWR1bGVcIjtcbmltcG9ydCBTdG9yZSBmcm9tIFwiLi91dGlsL3N0b3JlXCI7XG5pbXBvcnQgeyBnZXRDdXJyZW50VmlkZW8gfSBmcm9tIFwiLi91dGlsL3ZpZGVvXCI7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgIGNvbnN0IGludGVydmFscyA9IHtcbiAgICAgICAgc3luY0J1dHRvbjogbnVsbCxcbiAgICAgICAgbGVhdmVCdXR0b246IG51bGwsXG4gICAgICAgIHJlbW92ZVVwbmV4dDogbnVsbCxcbiAgICAgICAgcXVldWVJbmplY3Q6IG51bGwsXG4gICAgICAgIHF1ZXVlQWRkQnV0dG9uOiBudWxsXG4gICAgfTtcblxuICAgIGNvbnN0IHBsYXllciA9IG5ldyBQbGF5ZXIoe1xuICAgICAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgICAgICBwcm90b2NvbDogJ2h0dHAnLFxuICAgICAgICAgICAgaG9zdDogJzEyNy4wLjAuMScsXG4gICAgICAgICAgICBwb3J0OiAnODA4MCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgdmlkZW9JZCA9IHVybFBhcmFtcy5nZXQoJ3YnKTtcbiAgICBjb25zdCBzZXNzaW9uSWQgPSB1cmxQYXJhbXMuZ2V0KFNlc3Npb25JZCk7XG5cbiAgICBpZiAoc2Vzc2lvbklkID09PSBudWxsKSB7XG4gICAgICAgIGludGVydmFscy5zeW5jQnV0dG9uID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIikpIHtcbiAgICAgICAgICAgICAgICB5dEhUTUwuaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbigkKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIpLCBcImNyZWF0ZS1zeW5jLWJ1dHRvblwiLCBcIkNyZWF0ZSBTeW5jXCIsIHl0SFRNTC5jcmVhdGVQbHVzSWNvbigpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHVybFBhcmFtcy5zZXQoU2Vzc2lvbklkLCBnZW5lcmF0ZVNlc3Npb25JZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnNlYXJjaCA9IHVybFBhcmFtcy50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxzLnN5bmNCdXR0b24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCA1MDApO1xuXG4gICAgICAgIGludGVydmFscy5xdWV1ZUFkZEJ1dHRvbiA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIpKSB7XG4gICAgICAgICAgICAgICAgeXRIVE1MLmluamVjdFl0UmVuZGVyZWRCdXR0b24oJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSwgXCJxdWV1ZS1hZGQtYnV0dG9uXCIsIFwiQWRkIHRvIFF1ZXVlXCIsIHl0SFRNTC5jcmVhdGVQbHVzSWNvbigpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFN0b3JlLmFkZEVsZW1lbnQoZ2V0Q3VycmVudFZpZGVvKCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxzLnF1ZXVlQWRkQnV0dG9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGludGVydmFscy5sZWF2ZUJ1dHRvbiA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIpKSB7XG4gICAgICAgICAgICAgICAgeXRIVE1MLmluamVjdFl0UmVuZGVyZWRCdXR0b24oJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSwgXCJsZWF2ZS1zeW5jLWJ1dHRvblwiLCBcIkxlYXZlIFN5bmNcIiwgeXRIVE1MLmNyZWF0ZUxlYXZlSWNvbigpLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHVybFBhcmFtcy5kZWxldGUoU2Vzc2lvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnNlYXJjaCA9IHVybFBhcmFtcy50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxzLmxlYXZlQnV0dG9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICBpbnRlcnZhbHMucmVtb3ZlVXBuZXh0ID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCQoXCJ5dGQtY29tcGFjdC1hdXRvcGxheS1yZW5kZXJlci55dGQtd2F0Y2gtbmV4dC1zZWNvbmRhcnktcmVzdWx0cy1yZW5kZXJlclwiKSkge1xuICAgICAgICAgICAgICAgIHl0SFRNTC5yZW1vdmVVcG5leHQoKTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5yZW1vdmVVcG5leHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCA1MDApO1xuXG4gICAgICAgIGludGVydmFscy5xdWV1ZUluamVjdCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwiZGl2I3NlY29uZGFyeSAjcGxheWxpc3RcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZW5kZXJlciA9IHl0SFRNTC5pbmplY3RFbXB0eVF1ZXVlU2hlbGwoXCJRdWV1ZVwiLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSByZW5kZXJlci5maW5kKCcjaXRlbXMnKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIuY3JlYXRlKHZpZGVvSWQsIHNlc3Npb25JZCwgaXRlbXMpO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxzLnF1ZXVlSW5qZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcbiAgICB9XG59OyIsImV4cG9ydCBjb25zdCBTZXNzaW9uSWQgPSAnc3luY0lkJztcbmV4cG9ydCBjb25zdCBRdWV1ZUlkID0gXCJRdWV1ZVwiOyIsImltcG9ydCB7IFF1ZXVlSWQgfSBmcm9tIFwiLi9jb25zdHNcIjtcbmltcG9ydCBTdG9yZSBmcm9tIFwiLi9zdG9yZVwiO1xuXG5leHBvcnQgY29uc3Qgc3RhcnRTZWVrQ2hlY2sgPSAocGxheWVyOiBZVC5QbGF5ZXIsIGludGVydmFsOiBudW1iZXIsIGNiOiAoKSA9PiB2b2lkKTogKCkgPT4gdm9pZCA9PiB7XG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjkyOTM4NzcvaG93LXRvLWxpc3Rlbi10by1zZWVrLWV2ZW50LWluLXlvdXR1YmUtZW1iZWQtYXBpXG4gICAgbGV0IGxhc3RUaW1lID0gLTE7XG5cbiAgICBjb25zdCBjaGVja1BsYXllclRpbWUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChsYXN0VGltZSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGlmKHBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpID09PSB1bnNhZmVXaW5kb3cuWVQuUGxheWVyU3RhdGUuUExBWUlORyApIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lID0gcGxheWVyLmdldEN1cnJlbnRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBleHBlY3RpbmcgMSBzZWNvbmQgaW50ZXJ2YWwgLCB3aXRoIDUwMCBtcyBtYXJnaW5cbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnModGltZSAtIGxhc3RUaW1lIC0gMSkgPiAwLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlcmUgd2FzIGEgc2VlayBvY2N1cmluZ1xuICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsYXN0VGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVyID0gc2V0SW50ZXJ2YWwoY2hlY2tQbGF5ZXJUaW1lLCBpbnRlcnZhbCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgIH07XG59O1xuXG5cbmV4cG9ydCBjb25zdCBzdGFydFVybENoYW5nZUNoZWNrID0gKGludGVydmFsOiBudW1iZXIsIGNiOiAobzogTG9jYXRpb24sIG46IExvY2F0aW9uKSA9PiB2b2lkKTogKCkgPT4gdm9pZCA9PiB7XG4gICAgbGV0IG9sZDogTG9jYXRpb24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHdpbmRvdy5sb2NhdGlvbikpO1xuICAgIGNvbnN0IGNoZWNrVVJMID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gd2luZG93LmxvY2F0aW9uO1xuXG4gICAgICAgIGlmKG9sZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgb2xkID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjdXJyZW50KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2xkLmhyZWYgIT09IGN1cnJlbnQuaHJlZikge1xuICAgICAgICAgICAgY2Iob2xkLCBjdXJyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9sZCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY3VycmVudCkpO1xuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVyID0gc2V0SW50ZXJ2YWwoY2hlY2tVUkwsIGludGVydmFsKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFF1ZXVlQWRkQ2hlY2tlciA9IChpbnRlcnZhbDogbnVtYmVyLCBjYjogKHZpZGVvOiBWaWRlbykgPT4gdm9pZCkgPT4ge1xuICAgIGNvbnN0IGNoZWNrUXVldWUgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBTdG9yZS5nZXRRdWV1ZSgpO1xuXG4gICAgICAgIGZvcihjb25zdCB2b2JqIG9mIGRhdGEpIHtcbiAgICAgICAgICAgIGNiKHZvYmopO1xuICAgICAgICAgICAgU3RvcmUucmVtb3ZlRWxlbWVudCh2b2JqKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBoYW5kbGVyID0gc2V0SW50ZXJ2YWwoY2hlY2tRdWV1ZSwgaW50ZXJ2YWwpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICB9O1xufTsiLCJpbXBvcnQgeyBRdWV1ZUlkIH0gZnJvbSBcIi4vY29uc3RzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JlIHtcbiAgICBwdWJsaWMgc3RhdGljIGdldFF1ZXVlKCk6IFZpZGVvW10ge1xuICAgICAgICBjb25zdCBqc29uID0gR01fZ2V0VmFsdWUoUXVldWVJZCwgXCJbXVwiKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoanNvbik7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBhZGRFbGVtZW50KHZpZGVvOiBWaWRlbyk6IHZvaWQge1xuICAgICAgICBjb25zdCBkYXRhID0gU3RvcmUuZ2V0UXVldWUoKTtcbiAgICAgICAgZGF0YS5wdXNoKHZpZGVvKTtcblxuICAgICAgICBTdG9yZS5zZXRRdWV1ZShkYXRhKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUVsZW1lbnQodmlkZW86IFZpZGVvKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBTdG9yZS5nZXRRdWV1ZSgpLmZpbHRlcigodikgPT4gdi52aWRlb0lkICE9PSB2aWRlby52aWRlb0lkKTtcbiAgICAgICAgU3RvcmUuc2V0UXVldWUoZGF0YSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgc2V0UXVldWUoZGF0YTogVmlkZW9bXSk6IHZvaWQge1xuICAgICAgICBHTV9zZXRWYWx1ZShRdWV1ZUlkLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgfVxufSIsImV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VRdWVyeVN0cmluZyhzZWFyY2hTdHJpbmcsIGRvY3VtZW50VGl0bGUpIHtcbiAgICBkb2N1bWVudFRpdGxlID0gdHlwZW9mIGRvY3VtZW50VGl0bGUgIT09ICd1bmRlZmluZWQnID8gZG9jdW1lbnRUaXRsZSA6IGRvY3VtZW50LnRpdGxlO1xuICAgIGNvbnN0IHVybFNwbGl0ID0gKHdpbmRvdy5sb2NhdGlvbi5ocmVmKS5zcGxpdChcIj9cIik7XG4gICAgY29uc3Qgb2JqID0ge1xuICAgICAgICBUaXRsZTogZG9jdW1lbnRUaXRsZSxcbiAgICAgICAgVXJsOiB1cmxTcGxpdFswXSArICc/JyArIHNlYXJjaFN0cmluZ1xuICAgIH07XG5cbiAgICBoaXN0b3J5LnB1c2hTdGF0ZShvYmosIG9iai5UaXRsZSwgb2JqLlVybCk7XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRWaWRlbygpOiBWaWRlbyB7XG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICBjb25zdCB2aWRlb0lkID0gcGFyYW1zLmdldCgndicpO1xuXG4gICAgaWYgKHZpZGVvSWQgPT09IG51bGwpXG4gICAgICAgIHJldHVybjtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHZpZGVvSWQsXG4gICAgICAgIHRpdGxlOiAkKCd5dGQtdmlkZW8tcHJpbWFyeS1pbmZvLXJlbmRlcmVyIGgxIHl0LWZvcm1hdHRlZC1zdHJpbmcnKS50ZXh0KCksXG4gICAgICAgIGJ5bGluZTogJCgneXRkLWNoYW5uZWwtbmFtZSBhJykudGV4dCgpXG4gICAgfTtcbn0iLCJleHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSk7XG59IiwiZnVuY3Rpb24gY3JlYXRlU3ZnKGQ6IHN0cmluZyk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHN2Z1xuICAgICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pZFlNaWQgbWVldFwiXG4gICAgICAgICAgICBmb2N1c2FibGU9XCJmYWxzZVwiXG4gICAgICAgICAgICBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIlxuICAgICAgICAgICAgc3R5bGU9XCJwb2ludGVyLWV2ZW50czogbm9uZTsgZGlzcGxheTogYmxvY2s7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7XCJcbiAgICAgICAgPlxuICAgICAgICAgICAgPGcgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD1cIiR7ZH1cIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIiAvPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICA8L3N2Zz5cbiAgICBgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBsdXNJY29uKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiBjcmVhdGVTdmcoXCJNMTkgMTNoLTZ2NmgtMnYtNkg1di0yaDZWNWgydjZoNnYyelwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxlYXZlSWNvbigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gY3JlYXRlU3ZnKFwiTTEwLjA5IDE1LjU5TDExLjUgMTdsNS01LTUtNS0xLjQxIDEuNDFMMTIuNjcgMTFIM3YyaDkuNjdsLTIuNTggMi41OXpNMTkgM0g1Yy0xLjExIDAtMiAuOS0yIDJ2NGgyVjVoMTR2MTRINXYtNEgzdjRjMCAxLjEuODkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMS0uOS0yLTItMnpcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFzaEljb24oKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuIGNyZWF0ZVN2ZyhcIk02IDE5YzAgMS4xLjkgMiAyIDJoOGMxLjEgMCAyLS45IDItMlY3SDZ2MTJ6TTE5IDRoLTMuNWwtMS0xaC01bC0xIDFINXYyaDE0VjR6XCIpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEljb25TaGVsbCgpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWljb24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIgLz5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uQnV0dG9uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uLWJ1dHRvbiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiBpZD1cImJ1dHRvblwiPmApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEZvcm1hdHRlZFN0cmluZyhjYjogKCkgPT4gdm9pZCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtZm9ybWF0dGVkLXN0cmluZyBpZD1cInRleHRcIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiAvPmApXG4gICAgICAgIC5jbGljayhjYik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0U2ltcGxlRW5kcG9pbnQoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8YSBjbGFzcz1cInl0LXNpbXBsZS1lbmRwb2ludCBzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIgdGFiaW5kZXg9XCItMVwiPlxuICAgIGApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEljb25CdXR0b25SZW5kZXJlcihpZDogc3RyaW5nLCBoYXNUZXh0OiBib29sZWFuKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8eXRkLWJ1dHRvbi1yZW5kZXJlclxuICAgICAgICAgICAgaWQ9XCIke2lkfVwiXG4gICAgICAgICAgICBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1tZW51LXJlbmRlcmVyIGZvcmNlLWljb24tYnV0dG9uIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCJcbiAgICAgICAgICAgIGJ1dHRvbi1yZW5kZXJlcj1cIlwiXG4gICAgICAgICAgICB1c2Uta2V5Ym9hcmQtZm9jdXNlZD1cIlwiXG4gICAgICAgICAgICBpcy1pY29uLWJ1dHRvbj1cIlwiXG4gICAgICAgICAgICAkeyFoYXNUZXh0ID8gXCJoYXMtbm8tdGV4dFwiIDogXCJcIn1cbiAgICAgICAgLz5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRNZW51UmVuZGVyZXIoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8eXRkLW1lbnUtcmVuZGVyZXIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtcGxheWxpc3QtcGFuZWwtdmlkZW8tcmVuZGVyZXJcIj5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRQbGF5bGlzdFBhbmVsVmlkZW9SZW5kZXJlcigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDx5dGQtcGxheWxpc3QtcGFuZWwtdmlkZW8tcmVuZGVyZXJcbiAgICAgICAgICAgIGlkPVwicGxheWxpc3QtaXRlbXNcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtcGxheWxpc3QtcGFuZWwtcmVuZGVyZXJcIlxuICAgICAgICAgICAgbG9ja3VwPVwiXCJcbiAgICAgICAgICAgIHdhdGNoLWNvbG9yLXVwZGF0ZV89XCJcIlxuICAgICAgICAgICAgY2FuLXJlb3JkZXI9XCJcIlxuICAgICAgICAgICAgdG91Y2gtcGVyc2lzdGVudC1kcmFnLWhhbmRsZT1cIlwiXG4gICAgICAgIC8+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0UGxheWxpc3RQYW5lbFJlbmRlcmVyKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1wbGF5bGlzdC1wYW5lbC1yZW5kZXJlclxuICAgICAgICAgICAgaWQ9XCJwbGF5bGlzdFwiXG4gICAgICAgICAgICBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC13YXRjaC1mbGV4eVwiXG4gICAgICAgICAgICBqcy1wYW5lbC1oZWlnaHRfPVwiXCJcbiAgICAgICAgICAgIGhhcy1wbGF5bGlzdC1idXR0b25zPVwiXCJcbiAgICAgICAgICAgIGhhcy10b29sYmFyXz1cIlwiXG4gICAgICAgICAgICBwbGF5bGlzdC10eXBlXz1cIlRMUFFcIixcbiAgICAgICAgICAgIGNvbGxhcHNpYmxlPVwiXCJcbiAgICAgICAgICAgIGNvbGxhcHNlZD1cIlwiXG4gICAgICAgIC8+XG4gICAgYCk7XG59XG5cbi8qKlxuICogSW5qZWN0IGEgWXRSZW5kZXJlZEJ1dHRvbiBpbnRvIGFuIG9iamVjdFxuICpcbiAqIEBwYXJhbSBvYmpJZCBUaGUgSWQgb2YgdGhlIG9iamVjdCB0aGUgWXRSZW5kZXJlZEJ1dHRvbiBzaG91bGQgYmUgaW5qZWN0ZWQgdG9cbiAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IG9mIHRoZSBidXR0b25cbiAqIEBwYXJhbSBpY29uIFRoZSBpY29uIG9mIHRoZSBidXR0b24gKG5lZWRzIHRvIGJlIGEgc3ZnIEVsZW1lbnQpXG4gKiBAcGFyYW0gY2IgVGhlIGZ1bmN0aW9uIHRoYXQgc2hvdWxkIGJlIGNhbGxlZCBvbiBidXR0b24gY2xpY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFl0UmVuZGVyZWRCdXR0b24ob2JqSWQ6IEpRdWVyeTxFbGVtZW50PiwgY29udGFpbmVySWQ6IHN0cmluZywgdGV4dDogc3RyaW5nIHwgbnVsbCwgaWNvbjogSlF1ZXJ5PEhUTUxFbGVtZW50PiwgY2I6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICAvLyBUaGUgY29tcGxldGUgYnV0dG9uIG5lZWRzIHRvIGJlIGluamVjdGVkIGV4YWN0bHkgbGlrZSB0aGlzXG4gICAgLy8gYmVjYXVzZSB3aGVuIHdlIGluamVjdCB0aGUgY29tcGxldGVseSBidWlsZCBidXR0b25cbiAgICAvLyBZVCByZW1vdmVzIGFsbCBpdHMgY29udGVudCBzbyB3ZSBuZWVkIHRvIHBhcnRpYWxseSBpbmplY3RcbiAgICAvLyBldmVyeXRoaW5nIGluIG9yZGVyIHRvIGdldCBpdCB0byB3b3JrXG4gICAgY29uc3QgaGFzVGV4dCA9IHRleHQgIT09IFwiXCIgJiYgdGV4dCAhPT0gbnVsbDtcblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGNyZWF0ZVl0SWNvbkJ1dHRvblJlbmRlcmVyKGNvbnRhaW5lcklkLCBoYXNUZXh0KTtcbiAgICAkKG9iaklkKVxuICAgICAgICAuYXBwZW5kKGNvbnRhaW5lcik7XG5cbiAgICBjb25zdCBhID0gY3JlYXRlWXRTaW1wbGVFbmRwb2ludCgpO1xuICAgICQoY29udGFpbmVyKVxuICAgICAgICAuYXBwZW5kKGEpO1xuXG4gICAgY29uc3QgaWNvbkJ1dHRvbiA9IGNyZWF0ZVl0SWNvbkJ1dHRvblNoZWxsKCk7XG5cbiAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBoYXNUZXh0ID8gY3JlYXRlWXRGb3JtYXR0ZWRTdHJpbmcoY2IpIDogbnVsbDtcbiAgICAkKGEpXG4gICAgICAgIC5hcHBlbmQoaWNvbkJ1dHRvbilcbiAgICAgICAgLmFwcGVuZChmb3JtYXR0ZWRTdHJpbmcpO1xuXG4gICAgaWYgKGhhc1RleHQpIHtcbiAgICAgICAgJChmb3JtYXR0ZWRTdHJpbmcpXG4gICAgICAgICAgICAudGV4dCh0ZXh0KTtcbiAgICB9XG5cbiAgICBjb25zdCBpY29uU2hlbGwgPSBjcmVhdGVZdEljb25TaGVsbCgpO1xuICAgICQoaWNvbkJ1dHRvbikuZmluZChcImJ1dHRvbiNidXR0b25cIilcbiAgICAgICAgLmFwcGVuZChpY29uU2hlbGwpXG4gICAgICAgIC5jbGljayhjYik7XG5cbiAgICAkKGljb25TaGVsbClcbiAgICAgICAgLmFwcGVuZChpY29uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVVwbmV4dCgpOiB2b2lkIHtcbiAgICAkKCd5dGQtY29tcGFjdC1hdXRvcGxheS1yZW5kZXJlci55dGQtd2F0Y2gtbmV4dC1zZWNvbmRhcnktcmVzdWx0cy1yZW5kZXJlcicpLnJlbW92ZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0VmlkZW9RdWV1ZUVsZW1lbnQob2JqOiBKUXVlcnk8RWxlbWVudD4sIHZpZGVvSWQ6IHN0cmluZywgdGl0bGU6IHN0cmluZywgYnlsaW5lOiBzdHJpbmcsIGNjYjogKCkgPT4gdm9pZCwgZGNiOiAoKSA9PiB2b2lkKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgY29uc3QgcGxheWxpc3RWaWRlb1JlbmRlcmVyID0gY3JlYXRlWXRQbGF5bGlzdFBhbmVsVmlkZW9SZW5kZXJlcigpO1xuICAgICQob2JqKVxuICAgICAgICAuYXBwZW5kKHBsYXlsaXN0VmlkZW9SZW5kZXJlcik7XG5cbiAgICBjb25zdCBtZW51UmVuZGVyZXIgPSBjcmVhdGVZdE1lbnVSZW5kZXJlcigpO1xuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdkaXYjbWVudScpXG4gICAgICAgIC5hcHBlbmQobWVudVJlbmRlcmVyKTtcblxuICAgICQobWVudVJlbmRlcmVyKS5maW5kKCd5dC1pY29uLWJ1dHRvbiNidXR0b24nKVxuICAgICAgICAuYXR0cignaGlkZGVuJywgJycpO1xuXG4gICAgaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbigkKG1lbnVSZW5kZXJlcikuZmluZCgnZGl2I3RvcC1sZXZlbC1idXR0b25zJyksIFwiXCIsIG51bGwsIGNyZWF0ZVRyYXNoSWNvbigpLCBkY2IpO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2EjdGh1bWJuYWlsID4geXQtaW1nLXNoYWRvdycpXG4gICAgICAgIC5jc3MoJ2JhY2tncm91bmQtY29sb3InLCAndHJhbnNwYXJlbnQnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2VtcHR5Jyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2ltZyNpbWcnKVxuICAgICAgICAgICAgLmF0dHIoJ3NyYycsIGBodHRwczovL2kueXRpbWcuY29tL3ZpLyR7dmlkZW9JZH0vaHFkZWZhdWx0LmpwZ2ApO1xuXG4gICAgICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdhI3RodW1ibmFpbCA+IHl0LWltZy1zaGFkb3cnKVxuICAgICAgICAgICAgLmF0dHIoJ2xvYWRlZCcpO1xuICAgIH0sIDUwMCk7XG5cbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnYSN3Yy1lbmRwb2ludCcpXG4gICAgICAgIC5jbGljayhjY2IpO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2EjdGh1bWJuYWlsJylcbiAgICAgICAgLmNsaWNrKGNjYik7XG5cbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnc3BhbiN2aWRlby10aXRsZScpXG4gICAgICAgIC50ZXh0KHRpdGxlKTtcblxuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdzcGFuI2J5bGluZScpXG4gICAgICAgIC50ZXh0KGJ5bGluZSk7XG5cbiAgICByZXR1cm4gcGxheWxpc3RWaWRlb1JlbmRlcmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0RW1wdHlRdWV1ZVNoZWxsKHRpdGxlOiBzdHJpbmcsIGNvbGxhcHNpYmxlOiBib29sZWFuLCBjb2xsYXBzZWQ6IGJvb2xlYW4pOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICBjb25zdCByZW5kZXJlciA9IGNyZWF0ZVl0UGxheWxpc3RQYW5lbFJlbmRlcmVyKCk7XG4gICAgJCgnZGl2I3NlY29uZGFyeSAjcGxheWxpc3QnKVxuICAgICAgICAucmVwbGFjZVdpdGgocmVuZGVyZXIpO1xuXG4gICAgaWYoIWNvbGxhcHNpYmxlKSB7XG4gICAgICAgICQocmVuZGVyZXIpXG4gICAgICAgICAgICAucmVtb3ZlQXR0cignY29sbGFwc2libGUnKVxuICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NvbGxhcHNlZCcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYoIWNvbGxhcHNlZCkge1xuICAgICAgICAgICAgJChyZW5kZXJlcilcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignY29sbGFwc2VkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkKCdkaXYjc2Vjb25kYXJ5ICNwbGF5bGlzdCBoMyB5dC1mb3JtYXR0ZWQtc3RyaW5nJylcbiAgICAgICAgLnRleHQodGl0bGUpO1xuXG4gICAgcmV0dXJuIHJlbmRlcmVyO1xufSJdLCJzb3VyY2VSb290IjoiIn0=