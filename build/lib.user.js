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
    populateQueue(data) {
        this.queueElement.empty();
        data.videos.forEach((v) => {
            ytHTML.injectVideoQueueElement(this.queueElement, data.video !== null && v.videoId === data.video.videoId, v.videoId, v.title, v.byline, this.queueElementClickHandler(v.videoId), this.queueElementDeleteHandler(v.videoId));
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
function createYtPlaylistPanelVideoRenderer(selected) {
    return $(`
        <ytd-playlist-panel-video-renderer
            id="playlist-items"
            class="style-scope ytd-playlist-panel-renderer"
            lockup=""
            watch-color-update_=""
            can-reorder=""
            touch-persistent-drag-handle=""
            ${selected ? 'selected' : ''}
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
function injectVideoQueueElement(obj, selected, videoId, title, byline, ccb, dcb) {
    const playlistVideoRenderer = createYtPlaylistPanelVideoRenderer(selected);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL2NvbnN0cy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zY2hlZHVsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9zdG9yZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvdmlkZW8udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvd2Vic29ja2V0LnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3l0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2xGQSx3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QUFDO0FBckJELHNEQXFCQyIsImZpbGUiOiJsaWIudXNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3BsdWdpbi50c1wiKTtcbiIsImltcG9ydCB7IHN0YXJ0U2Vla0NoZWNrLCBzdGFydFVybENoYW5nZUNoZWNrLCBzdGFydFF1ZXVlQWRkQ2hlY2tlciB9IGZyb20gXCIuL3V0aWwvc2NoZWR1bGVcIjtcbmltcG9ydCB7IFNlc3Npb25JZCB9IGZyb20gXCIuL3V0aWwvY29uc3RzXCI7XG5pbXBvcnQgeyBjaGFuZ2VRdWVyeVN0cmluZyB9IGZyb20gXCIuL3V0aWwvdXJsXCI7XG5pbXBvcnQgKiBhcyB5dEhUTUwgZnJvbSAnLi91dGlsL3l0LWh0bWwnO1xuaW1wb3J0IHsgZ2V0Q3VycmVudFZpZGVvIH0gZnJvbSBcIi4vdXRpbC92aWRlb1wiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgICAgIGN1Y3U6IGFueTtcbiAgICAgICAgWVQ6IGFueTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBQbGF5ZXJPcHRpb25zIHtcbiAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgICAgIGhvc3Q6IHN0cmluZztcbiAgICAgICAgcG9ydDogc3RyaW5nO1xuICAgIH07XG59XG5cbmVudW0gTWVzc2FnZSB7XG4gICAgUExBWSA9ICdwbGF5JyxcbiAgICBQQVVTRSA9ICdwYXVzZScsXG4gICAgU0VFSyA9ICdzZWVrJyxcbiAgICBQTEFZX1ZJREVPID0gJ3BsYXktdmlkZW8nLFxuICAgIEFERF9UT19RVUVVRSA9IFwiYWRkLXRvLXF1ZXVlXCIsXG4gICAgREVMRVRFX0ZST01fUVVFVUUgPSBcImRlbGV0ZS1mcm9tLXF1ZXVlXCIsXG4gICAgUVVFVUUgPSAncXVldWUnXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XG4gICAgcHJpdmF0ZSB5dFBsYXllcjogWVQuUGxheWVyO1xuICAgIHByaXZhdGUgd3M6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcbiAgICBwcml2YXRlIG9wdGlvbnM6IFBsYXllck9wdGlvbnM7XG4gICAgcHJpdmF0ZSBxdWV1ZUVsZW1lbnQ6IEpRdWVyeTxFbGVtZW50PjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFBsYXllck9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlKHZpZGVvSWQ6IHN0cmluZywgc2Vzc2lvbklkOiBzdHJpbmcsIHF1ZXVlRWxlbWVudDogSlF1ZXJ5PEVsZW1lbnQ+KSB7XG4gICAgICAgIHRoaXMucXVldWVFbGVtZW50ID0gcXVldWVFbGVtZW50O1xuXG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgdW5zYWZlV2luZG93LllULlBsYXllcigneXRkLXBsYXllcicsIHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICB2aWRlb0lkLFxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xuICAgICAgICAgICAgICAgIGNvbG9yOiBcInJlZFwiLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBZVC5BdXRvUGxheS5BdXRvUGxheVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIG9uUmVhZHk6IChlKSA9PiB0aGlzLm9uUmVhZHkoZSwgc2Vzc2lvbklkLCB2aWRlb0lkKSxcbiAgICAgICAgICAgICAgICBvblN0YXRlQ2hhbmdlOiAoZSkgPT4gdGhpcy5vblN0YXRlQ2hhbmdlKGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5jdWN1ID0ge307XG4gICAgICAgIHdpbmRvdy5jdWN1LnBsYXllciA9IHRoaXMueXRQbGF5ZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlYWR5KF86IFlULlBsYXllckV2ZW50LCBzZXNzaW9uSWQ6IHN0cmluZywgdmlkZW9JZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHN0YXJ0U2Vla0NoZWNrKHRoaXMueXRQbGF5ZXIsIDEwMDAsICgpID0+IHRoaXMub25QbGF5ZXJTZWVrKCkpO1xuICAgICAgICBzdGFydFVybENoYW5nZUNoZWNrKDEwMDAsIChvLCBuKSA9PiB0aGlzLm9uVXJsQ2hhbmdlKG8sIG4pKTtcbiAgICAgICAgc3RhcnRRdWV1ZUFkZENoZWNrZXIoMTAwMCwgKHYpID0+IHRoaXMuYWRkVmlkZW9Ub1F1ZXVlKHYpKTtcblxuICAgICAgICB0aGlzLmNvbm5lY3RXcyhzZXNzaW9uSWQpO1xuICAgICAgICB0aGlzLmFkZFZpZGVvVG9RdWV1ZShnZXRDdXJyZW50VmlkZW8oKSk7XG4gICAgICAgIHRoaXMuc2VuZFdzTWVzc2FnZShNZXNzYWdlLlBMQVlfVklERU8sIHZpZGVvSWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TdGF0ZUNoYW5nZShldmVudDogWVQuT25TdGF0ZUNoYW5nZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIHN3aXRjaChldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBjYXNlIHVuc2FmZVdpbmRvdy5ZVC5QbGF5ZXJTdGF0ZS5QTEFZSU5HOlxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZFdzVGltZU1lc3NhZ2UoTWVzc2FnZS5QTEFZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdW5zYWZlV2luZG93LllULlBsYXllclN0YXRlLlBBVVNFRDpcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRXc1RpbWVNZXNzYWdlKE1lc3NhZ2UuUEFVU0UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblBsYXllclNlZWsoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2VuZFdzVGltZU1lc3NhZ2UoTWVzc2FnZS5TRUVLKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbmRXc1RpbWVNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5zZW5kV3NNZXNzYWdlKG1lc3NhZ2UsIHRoaXMueXRQbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKS50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbmRXc01lc3NhZ2UodHlwZTogTWVzc2FnZSwgZGF0YTogYW55KSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBhY3Rpb246IHR5cGUsXG4gICAgICAgICAgICBkYXRhXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblVybENoYW5nZShvOiBMb2NhdGlvbiwgbjogTG9jYXRpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVSTCBDSEFOR0U6ICR7by5ocmVmfSAtPiAke24uaHJlZn1gKTtcbiAgICAgICAgY29uc3Qgb2xkUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhvLnNlYXJjaCk7XG4gICAgICAgIGNvbnN0IG5ld1BhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobi5zZWFyY2gpO1xuXG4gICAgICAgIGNvbnN0IG9sZFNlc3Npb25JZCA9IG9sZFBhcmFtcy5nZXQoU2Vzc2lvbklkKTtcbiAgICAgICAgY29uc3QgbmV3U2Vzc2lvbklkID0gbmV3UGFyYW1zLmdldChTZXNzaW9uSWQpO1xuICAgICAgICBpZihvbGRTZXNzaW9uSWQgIT09IG51bGwgJiYgbmV3U2Vzc2lvbklkID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBuZXdQYXJhbXMuc2V0KFNlc3Npb25JZCwgb2xkU2Vzc2lvbklkKTtcbiAgICAgICAgICAgIC8vIGNoYW5nZVF1ZXJ5U3RyaW5nKG5ld1BhcmFtcy50b1N0cmluZygpLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnNlYXJjaCA9IG5ld1BhcmFtcy50b1N0cmluZygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmlkZW9JZCA9IG5ld1BhcmFtcy5nZXQoJ3YnKTtcbiAgICAgICAgaWYodmlkZW9JZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zZW5kV3NNZXNzYWdlKE1lc3NhZ2UuUExBWV9WSURFTywgdmlkZW9JZCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTG9hZGluZyBuZXcgVklERU86ICR7dmlkZW9JZH1gKTtcbiAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIubG9hZFZpZGVvQnlJZCh2aWRlb0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY29ubmVjdFdzKHNlc3Npb25JZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHsgcHJvdG9jb2wsIGhvc3QsIHBvcnQgfSA9IHRoaXMub3B0aW9ucy5jb25uZWN0aW9uO1xuXG4gICAgICAgIHRoaXMud3MgPSBpbyhgJHtwcm90b2NvbH06Ly8ke2hvc3R9OiR7cG9ydH0vJHtzZXNzaW9uSWR9YCwge1xuICAgICAgICAgICAgYXV0b0Nvbm5lY3Q6IHRydWUsXG4gICAgICAgICAgICBwYXRoOiAnL3NvY2tldC5pbydcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud3Mub24oJ2Nvbm5lY3QnLCAoKSA9PiB0aGlzLm9uV3NDb25uZWN0ZWQoKSk7XG4gICAgICAgIHRoaXMud3Mub24oJ21lc3NhZ2UnLCAoZDogc3RyaW5nKSA9PiB0aGlzLm9uV3NNZXNzYWdlKGQsIHRoaXMpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uV3NDb25uZWN0ZWQoKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ29ubmVjdGVkXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3luY1BsYXllclRpbWUodmlkZW9UaW1lOiBudW1iZXIsIG1hcmdpbjogbnVtYmVyID0gMS4wKTogdm9pZCB7XG4gICAgICAgIGlmIChNYXRoLmFicyh2aWRlb1RpbWUgLSB0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkpID4gbWFyZ2luKSB7XG4gICAgICAgICAgICB0aGlzLnl0UGxheWVyLnNlZWtUbyh2aWRlb1RpbWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwb3B1bGF0ZVF1ZXVlKGRhdGE6IHsgdmlkZW9zOiBWaWRlb1tdLCB2aWRlbzogVmlkZW8gfSk6IHZvaWQge1xuICAgICAgICB0aGlzLnF1ZXVlRWxlbWVudC5lbXB0eSgpO1xuXG4gICAgICAgIGRhdGEudmlkZW9zLmZvckVhY2goKHYpID0+IHtcbiAgICAgICAgICAgIHl0SFRNTC5pbmplY3RWaWRlb1F1ZXVlRWxlbWVudChcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlRWxlbWVudCxcbiAgICAgICAgICAgICAgICBkYXRhLnZpZGVvICE9PSBudWxsICYmIHYudmlkZW9JZCA9PT0gZGF0YS52aWRlby52aWRlb0lkLFxuICAgICAgICAgICAgICAgIHYudmlkZW9JZCxcbiAgICAgICAgICAgICAgICB2LnRpdGxlLFxuICAgICAgICAgICAgICAgIHYuYnlsaW5lLFxuICAgICAgICAgICAgICAgIHRoaXMucXVldWVFbGVtZW50Q2xpY2tIYW5kbGVyKHYudmlkZW9JZCksXG4gICAgICAgICAgICAgICAgdGhpcy5xdWV1ZUVsZW1lbnREZWxldGVIYW5kbGVyKHYudmlkZW9JZClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkVmlkZW9Ub1F1ZXVlKHZpZGVvOiBWaWRlbykge1xuICAgICAgICB0aGlzLnNlbmRXc01lc3NhZ2UoTWVzc2FnZS5BRERfVE9fUVVFVUUsIHZpZGVvKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHF1ZXVlRWxlbWVudENsaWNrSGFuZGxlcih2SWQ6IHN0cmluZyk6ICgpID0+IHZvaWQge1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VRdWVyeVN0cmluZ1ZpZGVvSWQodklkKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHF1ZXVlRWxlbWVudERlbGV0ZUhhbmRsZXIodklkOiBzdHJpbmcpOiAoKSA9PiB2b2lkIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2VuZFdzTWVzc2FnZShNZXNzYWdlLkRFTEVURV9GUk9NX1FVRVVFLCB2SWQpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hhbmdlUXVlcnlTdHJpbmdWaWRlb0lkKHZpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICAgIHBhcmFtcy5zZXQoJ3YnLCB2aWQpO1xuICAgICAgICBjaGFuZ2VRdWVyeVN0cmluZyhwYXJhbXMudG9TdHJpbmcoKSwgdW5kZWZpbmVkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uV3NNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZywgcGxheWVyOiBQbGF5ZXIpOiB2b2lkIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZCA9IGpzb24uYWN0aW9uO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGpzb24uZGF0YTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coYE1lc3NhZ2U6ICR7bWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgY29uc3QgcGxheWVyU3RhdGUgPSBwbGF5ZXIueXRQbGF5ZXIuZ2V0UGxheWVyU3RhdGUoKTtcblxuICAgICAgICAgICAgc3dpdGNoKGNvbW1hbmQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2UuUExBWS50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuc3luY1BsYXllclRpbWUocGFyc2VGbG9hdChkYXRhKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYocGxheWVyU3RhdGUgPT09IHVuc2FmZVdpbmRvdy5ZVC5QbGF5ZXJTdGF0ZS5QQVVTRUQpXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIucGxheVZpZGVvKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlLlBBVVNFLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5zeW5jUGxheWVyVGltZShwYXJzZUZsb2F0KGRhdGEpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihwbGF5ZXJTdGF0ZSA9PT0gdW5zYWZlV2luZG93LllULlBsYXllclN0YXRlLlBMQVlJTkcpXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIucGF1c2VWaWRlbygpO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5TRUVLLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5zZWVrVG8ocGFyc2VGbG9hdChkYXRhKSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZS5QTEFZX1ZJREVPLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlUXVlcnlTdHJpbmdWaWRlb0lkKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2UuUVVFVUUudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZVF1ZXVlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlKSB7IGNvbnNvbGUuZXJyb3IoZSk7IH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgUGxheWVyIGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0ICogYXMgeXRIVE1MIGZyb20gXCIuL3V0aWwveXQtaHRtbFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGVTZXNzaW9uSWQgfSBmcm9tIFwiLi91dGlsL3dlYnNvY2tldFwiO1xuaW1wb3J0IHsgU2Vzc2lvbklkIH0gZnJvbSBcIi4vdXRpbC9jb25zdHNcIjtcbmltcG9ydCB7IHN0YXJ0VXJsQ2hhbmdlQ2hlY2sgfSBmcm9tIFwiLi91dGlsL3NjaGVkdWxlXCI7XG5pbXBvcnQgU3RvcmUgZnJvbSBcIi4vdXRpbC9zdG9yZVwiO1xuaW1wb3J0IHsgZ2V0Q3VycmVudFZpZGVvIH0gZnJvbSBcIi4vdXRpbC92aWRlb1wiO1xuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cbiAgICBjb25zdCBpbnRlcnZhbHMgPSB7XG4gICAgICAgIHN5bmNCdXR0b246IG51bGwsXG4gICAgICAgIGxlYXZlQnV0dG9uOiBudWxsLFxuICAgICAgICByZW1vdmVVcG5leHQ6IG51bGwsXG4gICAgICAgIHF1ZXVlSW5qZWN0OiBudWxsLFxuICAgICAgICBxdWV1ZUFkZEJ1dHRvbjogbnVsbFxuICAgIH07XG5cbiAgICBjb25zdCBwbGF5ZXIgPSBuZXcgUGxheWVyKHtcbiAgICAgICAgY29ubmVjdGlvbjoge1xuICAgICAgICAgICAgcHJvdG9jb2w6ICdodHRwJyxcbiAgICAgICAgICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxuICAgICAgICAgICAgcG9ydDogJzgwODAnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHZpZGVvSWQgPSB1cmxQYXJhbXMuZ2V0KCd2Jyk7XG4gICAgY29uc3Qgc2Vzc2lvbklkID0gdXJsUGFyYW1zLmdldChTZXNzaW9uSWQpO1xuXG4gICAgaWYgKHNlc3Npb25JZCA9PT0gbnVsbCkge1xuICAgICAgICBpbnRlcnZhbHMuc3luY0J1dHRvbiA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIpKSB7XG4gICAgICAgICAgICAgICAgeXRIVE1MLmluamVjdFl0UmVuZGVyZWRCdXR0b24oJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSwgXCJjcmVhdGUtc3luYy1idXR0b25cIiwgXCJDcmVhdGUgU3luY1wiLCB5dEhUTUwuY3JlYXRlUGx1c0ljb24oKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXMuc2V0KFNlc3Npb25JZCwgZ2VuZXJhdGVTZXNzaW9uSWQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggPSB1cmxQYXJhbXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5zeW5jQnV0dG9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICBpbnRlcnZhbHMucXVldWVBZGRCdXR0b24gPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSkge1xuICAgICAgICAgICAgICAgIHl0SFRNTC5pbmplY3RZdFJlbmRlcmVkQnV0dG9uKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIiksIFwicXVldWUtYWRkLWJ1dHRvblwiLCBcIkFkZCB0byBRdWV1ZVwiLCB5dEhUTUwuY3JlYXRlUGx1c0ljb24oKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBTdG9yZS5hZGRFbGVtZW50KGdldEN1cnJlbnRWaWRlbygpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5xdWV1ZUFkZEJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpbnRlcnZhbHMubGVhdmVCdXR0b24gPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSkge1xuICAgICAgICAgICAgICAgIHl0SFRNTC5pbmplY3RZdFJlbmRlcmVkQnV0dG9uKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIiksIFwibGVhdmUtc3luYy1idXR0b25cIiwgXCJMZWF2ZSBTeW5jXCIsIHl0SFRNTC5jcmVhdGVMZWF2ZUljb24oKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXMuZGVsZXRlKFNlc3Npb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggPSB1cmxQYXJhbXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5sZWF2ZUJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG5cbiAgICAgICAgaW50ZXJ2YWxzLnJlbW92ZVVwbmV4dCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICgkKFwieXRkLWNvbXBhY3QtYXV0b3BsYXktcmVuZGVyZXIueXRkLXdhdGNoLW5leHQtc2Vjb25kYXJ5LXJlc3VsdHMtcmVuZGVyZXJcIikpIHtcbiAgICAgICAgICAgICAgICB5dEhUTUwucmVtb3ZlVXBuZXh0KCk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbHMucmVtb3ZlVXBuZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICBpbnRlcnZhbHMucXVldWVJbmplY3QgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoJChcImRpdiNzZWNvbmRhcnkgI3BsYXlsaXN0XCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZXIgPSB5dEhUTUwuaW5qZWN0RW1wdHlRdWV1ZVNoZWxsKFwiUXVldWVcIiwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gcmVuZGVyZXIuZmluZCgnI2l0ZW1zJyk7XG4gICAgICAgICAgICAgICAgcGxheWVyLmNyZWF0ZSh2aWRlb0lkLCBzZXNzaW9uSWQsIGl0ZW1zKTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFscy5xdWV1ZUluamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxufTsiLCJleHBvcnQgY29uc3QgU2Vzc2lvbklkID0gJ3N5bmNJZCc7XG5leHBvcnQgY29uc3QgUXVldWVJZCA9IFwiUXVldWVcIjsiLCJpbXBvcnQgeyBRdWV1ZUlkIH0gZnJvbSBcIi4vY29uc3RzXCI7XG5pbXBvcnQgU3RvcmUgZnJvbSBcIi4vc3RvcmVcIjtcblxuZXhwb3J0IGNvbnN0IHN0YXJ0U2Vla0NoZWNrID0gKHBsYXllcjogWVQuUGxheWVyLCBpbnRlcnZhbDogbnVtYmVyLCBjYjogKCkgPT4gdm9pZCk6ICgpID0+IHZvaWQgPT4ge1xuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI5MjkzODc3L2hvdy10by1saXN0ZW4tdG8tc2Vlay1ldmVudC1pbi15b3V0dWJlLWVtYmVkLWFwaVxuICAgIGxldCBsYXN0VGltZSA9IC0xO1xuXG4gICAgY29uc3QgY2hlY2tQbGF5ZXJUaW1lID0gKCkgPT4ge1xuICAgICAgICBpZiAobGFzdFRpbWUgIT09IC0xKSB7XG4gICAgICAgICAgICBpZihwbGF5ZXIuZ2V0UGxheWVyU3RhdGUoKSA9PT0gdW5zYWZlV2luZG93LllULlBsYXllclN0YXRlLlBMQVlJTkcgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZSA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0aW5nIDEgc2Vjb25kIGludGVydmFsICwgd2l0aCA1MDAgbXMgbWFyZ2luXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRpbWUgLSBsYXN0VGltZSAtIDEpID4gMC41KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZXJlIHdhcyBhIHNlZWsgb2NjdXJpbmdcbiAgICAgICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGFzdFRpbWUgPSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHNldEludGVydmFsKGNoZWNrUGxheWVyVGltZSwgaW50ZXJ2YWwpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICB9O1xufTtcblxuXG5leHBvcnQgY29uc3Qgc3RhcnRVcmxDaGFuZ2VDaGVjayA9IChpbnRlcnZhbDogbnVtYmVyLCBjYjogKG86IExvY2F0aW9uLCBuOiBMb2NhdGlvbikgPT4gdm9pZCk6ICgpID0+IHZvaWQgPT4ge1xuICAgIGxldCBvbGQ6IExvY2F0aW9uID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh3aW5kb3cubG9jYXRpb24pKTtcbiAgICBjb25zdCBjaGVja1VSTCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHdpbmRvdy5sb2NhdGlvbjtcblxuICAgICAgICBpZihvbGQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIG9sZCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY3VycmVudCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9sZC5ocmVmICE9PSBjdXJyZW50LmhyZWYpIHtcbiAgICAgICAgICAgIGNiKG9sZCwgY3VycmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBvbGQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGN1cnJlbnQpKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHNldEludGVydmFsKGNoZWNrVVJMLCBpbnRlcnZhbCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgIH07XG59O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRRdWV1ZUFkZENoZWNrZXIgPSAoaW50ZXJ2YWw6IG51bWJlciwgY2I6ICh2aWRlbzogVmlkZW8pID0+IHZvaWQpID0+IHtcbiAgICBjb25zdCBjaGVja1F1ZXVlID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gU3RvcmUuZ2V0UXVldWUoKTtcblxuICAgICAgICBmb3IoY29uc3Qgdm9iaiBvZiBkYXRhKSB7XG4gICAgICAgICAgICBjYih2b2JqKTtcbiAgICAgICAgICAgIFN0b3JlLnJlbW92ZUVsZW1lbnQodm9iaik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHNldEludGVydmFsKGNoZWNrUXVldWUsIGludGVydmFsKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgfTtcbn07IiwiaW1wb3J0IHsgUXVldWVJZCB9IGZyb20gXCIuL2NvbnN0c1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdG9yZSB7XG4gICAgcHVibGljIHN0YXRpYyBnZXRRdWV1ZSgpOiBWaWRlb1tdIHtcbiAgICAgICAgY29uc3QganNvbiA9IEdNX2dldFZhbHVlKFF1ZXVlSWQsIFwiW11cIik7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgYWRkRWxlbWVudCh2aWRlbzogVmlkZW8pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IFN0b3JlLmdldFF1ZXVlKCk7XG4gICAgICAgIGRhdGEucHVzaCh2aWRlbyk7XG5cbiAgICAgICAgU3RvcmUuc2V0UXVldWUoZGF0YSk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZW1vdmVFbGVtZW50KHZpZGVvOiBWaWRlbyk6IHZvaWQge1xuICAgICAgICBjb25zdCBkYXRhID0gU3RvcmUuZ2V0UXVldWUoKS5maWx0ZXIoKHYpID0+IHYudmlkZW9JZCAhPT0gdmlkZW8udmlkZW9JZCk7XG4gICAgICAgIFN0b3JlLnNldFF1ZXVlKGRhdGEpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHNldFF1ZXVlKGRhdGE6IFZpZGVvW10pOiB2b2lkIHtcbiAgICAgICAgR01fc2V0VmFsdWUoUXVldWVJZCwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIH1cbn0iLCJleHBvcnQgZnVuY3Rpb24gY2hhbmdlUXVlcnlTdHJpbmcoc2VhcmNoU3RyaW5nLCBkb2N1bWVudFRpdGxlKSB7XG4gICAgZG9jdW1lbnRUaXRsZSA9IHR5cGVvZiBkb2N1bWVudFRpdGxlICE9PSAndW5kZWZpbmVkJyA/IGRvY3VtZW50VGl0bGUgOiBkb2N1bWVudC50aXRsZTtcbiAgICBjb25zdCB1cmxTcGxpdCA9ICh3aW5kb3cubG9jYXRpb24uaHJlZikuc3BsaXQoXCI/XCIpO1xuICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgVGl0bGU6IGRvY3VtZW50VGl0bGUsXG4gICAgICAgIFVybDogdXJsU3BsaXRbMF0gKyAnPycgKyBzZWFyY2hTdHJpbmdcbiAgICB9O1xuXG4gICAgaGlzdG9yeS5wdXNoU3RhdGUob2JqLCBvYmouVGl0bGUsIG9iai5VcmwpO1xufSIsImV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50VmlkZW8oKTogVmlkZW8ge1xuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgY29uc3QgdmlkZW9JZCA9IHBhcmFtcy5nZXQoJ3YnKTtcblxuICAgIGlmICh2aWRlb0lkID09PSBudWxsKVxuICAgICAgICByZXR1cm47XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB2aWRlb0lkLFxuICAgICAgICB0aXRsZTogJCgneXRkLXZpZGVvLXByaW1hcnktaW5mby1yZW5kZXJlciBoMSB5dC1mb3JtYXR0ZWQtc3RyaW5nJykudGV4dCgpLFxuICAgICAgICBieWxpbmU6ICQoJ3l0ZC1jaGFubmVsLW5hbWUgYScpLnRleHQoKVxuICAgIH07XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU2Vzc2lvbklkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSkgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpO1xufSIsImZ1bmN0aW9uIGNyZWF0ZVN2ZyhkOiBzdHJpbmcpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDxzdmdcbiAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgICAgcHJlc2VydmVBc3BlY3RSYXRpbz1cInhNaWRZTWlkIG1lZXRcIlxuICAgICAgICAgICAgZm9jdXNhYmxlPVwiZmFsc2VcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCJcbiAgICAgICAgICAgIHN0eWxlPVwicG9pbnRlci1ldmVudHM6IG5vbmU7IGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlO1wiXG4gICAgICAgID5cbiAgICAgICAgICAgIDxnIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCIke2R9XCIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCIgLz5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgPC9zdmc+XG4gICAgYCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQbHVzSWNvbigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gY3JlYXRlU3ZnKFwiTTE5IDEzaC02djZoLTJ2LTZINXYtMmg2VjVoMnY2aDZ2MnpcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMZWF2ZUljb24oKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuIGNyZWF0ZVN2ZyhcIk0xMC4wOSAxNS41OUwxMS41IDE3bDUtNS01LTUtMS40MSAxLjQxTDEyLjY3IDExSDN2Mmg5LjY3bC0yLjU4IDIuNTl6TTE5IDNINWMtMS4xMSAwLTIgLjktMiAydjRoMlY1aDE0djE0SDV2LTRIM3Y0YzAgMS4xLjg5IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6XCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJhc2hJY29uKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiBjcmVhdGVTdmcoXCJNNiAxOWMwIDEuMS45IDIgMiAyaDhjMS4xIDAgMi0uOSAyLTJWN0g2djEyek0xOSA0aC0zLjVsLTEtMWgtNWwtMSAxSDV2MmgxNFY0elwiKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLWJ1dHRvbi1yZW5kZXJlclwiIC8+YCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0SWNvbkJ1dHRvblNoZWxsKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtaWNvbi1idXR0b24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgaWQ9XCJidXR0b25cIj5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRGb3JtYXR0ZWRTdHJpbmcoY2I6ICgpID0+IHZvaWQpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWZvcm1hdHRlZC1zdHJpbmcgaWQ9XCJ0ZXh0XCIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgLz5gKVxuICAgICAgICAuY2xpY2soY2IpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdFNpbXBsZUVuZHBvaW50KCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPGEgY2xhc3M9XCJ5dC1zaW1wbGUtZW5kcG9pbnQgc3R5bGUtc2NvcGUgeXRkLWJ1dHRvbi1yZW5kZXJlclwiIHRhYmluZGV4PVwiLTFcIj5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uQnV0dG9uUmVuZGVyZXIoaWQ6IHN0cmluZywgaGFzVGV4dDogYm9vbGVhbik6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1idXR0b24tcmVuZGVyZXJcbiAgICAgICAgICAgIGlkPVwiJHtpZH1cIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtbWVudS1yZW5kZXJlciBmb3JjZS1pY29uLWJ1dHRvbiBzdHlsZS1kZWZhdWx0IHNpemUtZGVmYXVsdFwiXG4gICAgICAgICAgICBidXR0b24tcmVuZGVyZXI9XCJcIlxuICAgICAgICAgICAgdXNlLWtleWJvYXJkLWZvY3VzZWQ9XCJcIlxuICAgICAgICAgICAgaXMtaWNvbi1idXR0b249XCJcIlxuICAgICAgICAgICAgJHshaGFzVGV4dCA/IFwiaGFzLW5vLXRleHRcIiA6IFwiXCJ9XG4gICAgICAgIC8+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0TWVudVJlbmRlcmVyKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1tZW51LXJlbmRlcmVyIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLXBsYXlsaXN0LXBhbmVsLXZpZGVvLXJlbmRlcmVyXCI+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0UGxheWxpc3RQYW5lbFZpZGVvUmVuZGVyZXIoc2VsZWN0ZWQ6IGJvb2xlYW4pOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDx5dGQtcGxheWxpc3QtcGFuZWwtdmlkZW8tcmVuZGVyZXJcbiAgICAgICAgICAgIGlkPVwicGxheWxpc3QtaXRlbXNcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtcGxheWxpc3QtcGFuZWwtcmVuZGVyZXJcIlxuICAgICAgICAgICAgbG9ja3VwPVwiXCJcbiAgICAgICAgICAgIHdhdGNoLWNvbG9yLXVwZGF0ZV89XCJcIlxuICAgICAgICAgICAgY2FuLXJlb3JkZXI9XCJcIlxuICAgICAgICAgICAgdG91Y2gtcGVyc2lzdGVudC1kcmFnLWhhbmRsZT1cIlwiXG4gICAgICAgICAgICAke3NlbGVjdGVkID8gJ3NlbGVjdGVkJyA6ICcnfVxuICAgICAgICAvPlxuICAgIGApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdFBsYXlsaXN0UGFuZWxSZW5kZXJlcigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDx5dGQtcGxheWxpc3QtcGFuZWwtcmVuZGVyZXJcbiAgICAgICAgICAgIGlkPVwicGxheWxpc3RcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtd2F0Y2gtZmxleHlcIlxuICAgICAgICAgICAganMtcGFuZWwtaGVpZ2h0Xz1cIlwiXG4gICAgICAgICAgICBoYXMtcGxheWxpc3QtYnV0dG9ucz1cIlwiXG4gICAgICAgICAgICBoYXMtdG9vbGJhcl89XCJcIlxuICAgICAgICAgICAgcGxheWxpc3QtdHlwZV89XCJUTFBRXCIsXG4gICAgICAgICAgICBjb2xsYXBzaWJsZT1cIlwiXG4gICAgICAgICAgICBjb2xsYXBzZWQ9XCJcIlxuICAgICAgICAvPlxuICAgIGApO1xufVxuXG4vKipcbiAqIEluamVjdCBhIFl0UmVuZGVyZWRCdXR0b24gaW50byBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gb2JqSWQgVGhlIElkIG9mIHRoZSBvYmplY3QgdGhlIFl0UmVuZGVyZWRCdXR0b24gc2hvdWxkIGJlIGluamVjdGVkIHRvXG4gKiBAcGFyYW0gdGV4dCBUaGUgdGV4dCBvZiB0aGUgYnV0dG9uXG4gKiBAcGFyYW0gaWNvbiBUaGUgaWNvbiBvZiB0aGUgYnV0dG9uIChuZWVkcyB0byBiZSBhIHN2ZyBFbGVtZW50KVxuICogQHBhcmFtIGNiIFRoZSBmdW5jdGlvbiB0aGF0IHNob3VsZCBiZSBjYWxsZWQgb24gYnV0dG9uIGNsaWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RZdFJlbmRlcmVkQnV0dG9uKG9iaklkOiBKUXVlcnk8RWxlbWVudD4sIGNvbnRhaW5lcklkOiBzdHJpbmcsIHRleHQ6IHN0cmluZyB8IG51bGwsIGljb246IEpRdWVyeTxIVE1MRWxlbWVudD4sIGNiOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgLy8gVGhlIGNvbXBsZXRlIGJ1dHRvbiBuZWVkcyB0byBiZSBpbmplY3RlZCBleGFjdGx5IGxpa2UgdGhpc1xuICAgIC8vIGJlY2F1c2Ugd2hlbiB3ZSBpbmplY3QgdGhlIGNvbXBsZXRlbHkgYnVpbGQgYnV0dG9uXG4gICAgLy8gWVQgcmVtb3ZlcyBhbGwgaXRzIGNvbnRlbnQgc28gd2UgbmVlZCB0byBwYXJ0aWFsbHkgaW5qZWN0XG4gICAgLy8gZXZlcnl0aGluZyBpbiBvcmRlciB0byBnZXQgaXQgdG8gd29ya1xuICAgIGNvbnN0IGhhc1RleHQgPSB0ZXh0ICE9PSBcIlwiICYmIHRleHQgIT09IG51bGw7XG5cbiAgICBjb25zdCBjb250YWluZXIgPSBjcmVhdGVZdEljb25CdXR0b25SZW5kZXJlcihjb250YWluZXJJZCwgaGFzVGV4dCk7XG4gICAgJChvYmpJZClcbiAgICAgICAgLmFwcGVuZChjb250YWluZXIpO1xuXG4gICAgY29uc3QgYSA9IGNyZWF0ZVl0U2ltcGxlRW5kcG9pbnQoKTtcbiAgICAkKGNvbnRhaW5lcilcbiAgICAgICAgLmFwcGVuZChhKTtcblxuICAgIGNvbnN0IGljb25CdXR0b24gPSBjcmVhdGVZdEljb25CdXR0b25TaGVsbCgpO1xuXG4gICAgY29uc3QgZm9ybWF0dGVkU3RyaW5nID0gaGFzVGV4dCA/IGNyZWF0ZVl0Rm9ybWF0dGVkU3RyaW5nKGNiKSA6IG51bGw7XG4gICAgJChhKVxuICAgICAgICAuYXBwZW5kKGljb25CdXR0b24pXG4gICAgICAgIC5hcHBlbmQoZm9ybWF0dGVkU3RyaW5nKTtcblxuICAgIGlmIChoYXNUZXh0KSB7XG4gICAgICAgICQoZm9ybWF0dGVkU3RyaW5nKVxuICAgICAgICAgICAgLnRleHQodGV4dCk7XG4gICAgfVxuXG4gICAgY29uc3QgaWNvblNoZWxsID0gY3JlYXRlWXRJY29uU2hlbGwoKTtcbiAgICAkKGljb25CdXR0b24pLmZpbmQoXCJidXR0b24jYnV0dG9uXCIpXG4gICAgICAgIC5hcHBlbmQoaWNvblNoZWxsKVxuICAgICAgICAuY2xpY2soY2IpO1xuXG4gICAgJChpY29uU2hlbGwpXG4gICAgICAgIC5hcHBlbmQoaWNvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVVcG5leHQoKTogdm9pZCB7XG4gICAgJCgneXRkLWNvbXBhY3QtYXV0b3BsYXktcmVuZGVyZXIueXRkLXdhdGNoLW5leHQtc2Vjb25kYXJ5LXJlc3VsdHMtcmVuZGVyZXInKS5yZW1vdmUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdFZpZGVvUXVldWVFbGVtZW50KG9iajogSlF1ZXJ5PEVsZW1lbnQ+LCBzZWxlY3RlZDogYm9vbGVhbiwgdmlkZW9JZDogc3RyaW5nLCB0aXRsZTogc3RyaW5nLCBieWxpbmU6IHN0cmluZywgY2NiOiAoKSA9PiB2b2lkLCBkY2I6ICgpID0+IHZvaWQpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICBjb25zdCBwbGF5bGlzdFZpZGVvUmVuZGVyZXIgPSBjcmVhdGVZdFBsYXlsaXN0UGFuZWxWaWRlb1JlbmRlcmVyKHNlbGVjdGVkKTtcbiAgICAkKG9iailcbiAgICAgICAgLmFwcGVuZChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpO1xuXG4gICAgY29uc3QgbWVudVJlbmRlcmVyID0gY3JlYXRlWXRNZW51UmVuZGVyZXIoKTtcbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnZGl2I21lbnUnKVxuICAgICAgICAuYXBwZW5kKG1lbnVSZW5kZXJlcik7XG5cbiAgICAkKG1lbnVSZW5kZXJlcikuZmluZCgneXQtaWNvbi1idXR0b24jYnV0dG9uJylcbiAgICAgICAgLmF0dHIoJ2hpZGRlbicsICcnKTtcblxuICAgIGluamVjdFl0UmVuZGVyZWRCdXR0b24oJChtZW51UmVuZGVyZXIpLmZpbmQoJ2RpdiN0b3AtbGV2ZWwtYnV0dG9ucycpLCBcIlwiLCBudWxsLCBjcmVhdGVUcmFzaEljb24oKSwgZGNiKTtcblxuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdhI3RodW1ibmFpbCA+IHl0LWltZy1zaGFkb3cnKVxuICAgICAgICAuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJywgJ3RyYW5zcGFyZW50JylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdlbXB0eScpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdpbWcjaW1nJylcbiAgICAgICAgICAgIC5hdHRyKCdzcmMnLCBgaHR0cHM6Ly9pLnl0aW1nLmNvbS92aS8ke3ZpZGVvSWR9L2hxZGVmYXVsdC5qcGdgKTtcblxuICAgICAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnYSN0aHVtYm5haWwgPiB5dC1pbWctc2hhZG93JylcbiAgICAgICAgICAgIC5hdHRyKCdsb2FkZWQnKTtcbiAgICB9LCA1MDApO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ2Ejd2MtZW5kcG9pbnQnKVxuICAgICAgICAuY2xpY2soY2NiKTtcblxuICAgICQocGxheWxpc3RWaWRlb1JlbmRlcmVyKS5maW5kKCdhI3RodW1ibmFpbCcpXG4gICAgICAgIC5jbGljayhjY2IpO1xuXG4gICAgJChwbGF5bGlzdFZpZGVvUmVuZGVyZXIpLmZpbmQoJ3NwYW4jdmlkZW8tdGl0bGUnKVxuICAgICAgICAudGV4dCh0aXRsZSk7XG5cbiAgICAkKHBsYXlsaXN0VmlkZW9SZW5kZXJlcikuZmluZCgnc3BhbiNieWxpbmUnKVxuICAgICAgICAudGV4dChieWxpbmUpO1xuXG4gICAgcmV0dXJuIHBsYXlsaXN0VmlkZW9SZW5kZXJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdEVtcHR5UXVldWVTaGVsbCh0aXRsZTogc3RyaW5nLCBjb2xsYXBzaWJsZTogYm9vbGVhbiwgY29sbGFwc2VkOiBib29sZWFuKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgY29uc3QgcmVuZGVyZXIgPSBjcmVhdGVZdFBsYXlsaXN0UGFuZWxSZW5kZXJlcigpO1xuICAgICQoJ2RpdiNzZWNvbmRhcnkgI3BsYXlsaXN0JylcbiAgICAgICAgLnJlcGxhY2VXaXRoKHJlbmRlcmVyKTtcblxuICAgIGlmKCFjb2xsYXBzaWJsZSkge1xuICAgICAgICAkKHJlbmRlcmVyKVxuICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NvbGxhcHNpYmxlJylcbiAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdjb2xsYXBzZWQnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmKCFjb2xsYXBzZWQpIHtcbiAgICAgICAgICAgICQocmVuZGVyZXIpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2NvbGxhcHNlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJCgnZGl2I3NlY29uZGFyeSAjcGxheWxpc3QgaDMgeXQtZm9ybWF0dGVkLXN0cmluZycpXG4gICAgICAgIC50ZXh0KHRpdGxlKTtcblxuICAgIHJldHVybiByZW5kZXJlcjtcbn0iXSwic291cmNlUm9vdCI6IiJ9