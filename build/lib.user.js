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
    create(videoId, roomId) {
        this.connectWs(roomId);
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
        // https://stackoverflow.com/questions/29293877/how-to-listen-to-seek-event-in-youtube-embed-api
        let lastTime = -1;
        const interval = 1000;
        const checkPlayerTime = () => {
            if (lastTime !== -1) {
                if (this.ytPlayer.getPlayerState() === 1 /* PLAYING */) {
                    const time = this.ytPlayer.getCurrentTime();
                    // expecting 1 second interval , with 500 ms margin
                    if (Math.abs(time - lastTime - 1) > 0.5) {
                        // there was a seek occuring
                        this.onPlayerSeek();
                    }
                }
            }
            lastTime = this.ytPlayer.getCurrentTime();
            setTimeout(checkPlayerTime, interval); // repeat function call in 1 second
        };
        setTimeout(checkPlayerTime, interval); // initial call delayed
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
    connectWs(roomId) {
        const { protocol, host, port } = this.options.connection;
        this.ws = io(`${protocol}://${host}:${port}/${roomId}`, {
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
        console.log(`Message: ${message}`);
        const [command, data] = message.split(" ");
        console.log(command);
        console.log(data);
        switch (command) {
            case Messages.PLAY.toString():
                console.log("PLAY COMMAND RECEIVED");
                console.log(player);
                player.ytPlayer.playVideo();
                break;
            case Messages.PAUSE.toString():
                console.log("PAUSE COMMAND RECEIVED");
                console.log(player);
                player.ytPlayer.pauseVideo();
                break;
            case Messages.SEEK.toString():
                console.log("SEEK COMMAND RECEIVED");
                console.log(player);
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
    const roomId = urlParams.get('syncId');
    if (roomId === null) {
        const injectSyncButtonInterval = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                yt_html_1.injectYtRenderedButton("div#info ytd-menu-renderer div#top-level-buttons", "create-sync-button", "Create Sync", yt_html_1.createPlusIcon(), () => {
                    const rId = websocket_1.generateRoomId();
                    urlParams.set('syncId', rId);
                    window.location.search = urlParams.toString();
                    console.log(`Updates Query Params: ${rId}`);
                });
                clearInterval(injectSyncButtonInterval);
            }
        }, 500);
    }
    else {
        player.create(videoId, roomId);
    }
};


/***/ }),

/***/ "./src/util/websocket.ts":
/*!*******************************!*\
  !*** ./src/util/websocket.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function generateRoomId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
exports.generateRoomId = generateRoomId;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3dlYnNvY2tldC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC95dC1odG1sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUNwRUEsSUFBSyxRQUlKO0FBSkQsV0FBSyxRQUFRO0lBQ1QseUJBQWE7SUFDYiwyQkFBZTtJQUNmLHlCQUFhO0FBQ2pCLENBQUMsRUFKSSxRQUFRLEtBQVIsUUFBUSxRQUlaO0FBRUQsTUFBcUIsTUFBTTtJQUt2QixZQUFZLE9BQXNCO1FBQzlCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFF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Q0FBQyxVQUFVLENBQUM7U0FDbEIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRTdCLENBQUMsQ0FBQyxlQUFlLENBQUM7U0FDYixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFaEIsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztJQUN0QyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztTQUM5QixNQUFNLENBQUMsU0FBUyxDQUFDO1NBQ2pCLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVmLENBQUMsQ0FBQyxTQUFTLENBQUM7U0FDUCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsQ0FBQztBQWpDRCx3REFpQ0MiLCJmaWxlIjoibGliLnVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9wbHVnaW4udHNcIik7XG4iLCJpbXBvcnQgeyBnZW5lcmF0ZVJvb21JZCB9IGZyb20gXCIuL3V0aWwvd2Vic29ja2V0XCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBpbnRlcmZhY2UgV2luZG93IHsgY3VjdTogYW55OyB9XG59XG5cbmludGVyZmFjZSBQbGF5ZXJPcHRpb25zIHtcbiAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgICAgIGhvc3Q6IHN0cmluZztcbiAgICAgICAgcG9ydDogc3RyaW5nO1xuICAgIH07XG59XG5cbmVudW0gTWVzc2FnZXMge1xuICAgIFBMQVkgPSBcInBsYXlcIixcbiAgICBQQVVTRSA9IFwicGF1c2VcIixcbiAgICBTRUVLID0gXCJzZWVrXCJcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyIHtcbiAgICBwcml2YXRlIHl0UGxheWVyOiBZVC5QbGF5ZXI7XG4gICAgcHVibGljIHdzOiBTb2NrZXRJT0NsaWVudC5Tb2NrZXQ7XG4gICAgcHJpdmF0ZSBvcHRpb25zOiBQbGF5ZXJPcHRpb25zO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogUGxheWVyT3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGUodmlkZW9JZDogc3RyaW5nLCByb29tSWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNvbm5lY3RXcyhyb29tSWQpO1xuXG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgd2luZG93LllULlBsYXllcigneXRkLXBsYXllcicsIHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICB2aWRlb0lkLFxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xuICAgICAgICAgICAgICAgIGNvbG9yOiBcInJlZFwiLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBZVC5BdXRvUGxheS5BdXRvUGxheVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIG9uUmVhZHk6IChlKSA9PiB0aGlzLm9uUmVhZHkoZSksXG4gICAgICAgICAgICAgICAgb25TdGF0ZUNoYW5nZTogKGUpID0+IHRoaXMub25TdGF0ZUNoYW5nZShlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuY3VjdSA9IHt9O1xuICAgICAgICB3aW5kb3cuY3VjdS5wbGF5ZXIgPSB0aGlzLnl0UGxheWVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25SZWFkeShfOiBZVC5QbGF5ZXJFdmVudCk6IHZvaWQge1xuICAgICAgICB0aGlzLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcblxuICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yOTI5Mzg3Ny9ob3ctdG8tbGlzdGVuLXRvLXNlZWstZXZlbnQtaW4teW91dHViZS1lbWJlZC1hcGlcbiAgICAgICAgbGV0IGxhc3RUaW1lID0gLTE7XG4gICAgICAgIGNvbnN0IGludGVydmFsID0gMTAwMDtcblxuICAgICAgICBjb25zdCBjaGVja1BsYXllclRpbWUgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAobGFzdFRpbWUgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYodGhpcy55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpID09PSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUExBWUlORyApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZSA9IHRoaXMueXRQbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBleHBlY3RpbmcgMSBzZWNvbmQgaW50ZXJ2YWwgLCB3aXRoIDUwMCBtcyBtYXJnaW5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRpbWUgLSBsYXN0VGltZSAtIDEpID4gMC41KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGVyZSB3YXMgYSBzZWVrIG9jY3VyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUGxheWVyU2VlaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFRpbWUgPSB0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrUGxheWVyVGltZSwgaW50ZXJ2YWwpOyAvLyByZXBlYXQgZnVuY3Rpb24gY2FsbCBpbiAxIHNlY29uZFxuICAgICAgICB9O1xuXG4gICAgICAgIHNldFRpbWVvdXQoY2hlY2tQbGF5ZXJUaW1lLCBpbnRlcnZhbCk7IC8vIGluaXRpYWwgY2FsbCBkZWxheWVkXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN0YXRlQ2hhbmdlKGV2ZW50OiBZVC5PblN0YXRlQ2hhbmdlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYE5ldyBTdGF0ZSAke2V2ZW50LmRhdGF9YCk7XG4gICAgICAgIHN3aXRjaChldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBjYXNlIHdpbmRvdy5ZVC5QbGF5ZXJTdGF0ZS5QTEFZSU5HOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKE1lc3NhZ2VzLlBMQVkpO1xuICAgICAgICAgICAgICAgIHRoaXMud3Muc2VuZChNZXNzYWdlcy5QTEFZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2Ugd2luZG93LllULlBsYXllclN0YXRlLlBBVVNFRDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhNZXNzYWdlcy5QQVVTRSk7XG4gICAgICAgICAgICAgICAgdGhpcy53cy5zZW5kKE1lc3NhZ2VzLlBBVVNFKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25QbGF5ZXJTZWVrKCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtNZXNzYWdlcy5TRUVLfSAke3RoaXMueXRQbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKX1gKTtcbiAgICAgICAgdGhpcy53cy5zZW5kKGAke01lc3NhZ2VzLlNFRUt9ICR7dGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpfWApO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29ubmVjdFdzKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHsgcHJvdG9jb2wsIGhvc3QsIHBvcnQgfSA9IHRoaXMub3B0aW9ucy5jb25uZWN0aW9uO1xuXG4gICAgICAgIHRoaXMud3MgPSBpbyhgJHtwcm90b2NvbH06Ly8ke2hvc3R9OiR7cG9ydH0vJHtyb29tSWR9YCwge1xuICAgICAgICAgICAgYXV0b0Nvbm5lY3Q6IHRydWUsXG4gICAgICAgICAgICBwYXRoOiAnL3NvY2tldC5pbydcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud3Mub24oJ2Nvbm5lY3QnLCAoKSA9PiB0aGlzLm9uV3NDb25uZWN0ZWQoKSk7XG4gICAgICAgIHRoaXMud3Mub24oJ21lc3NhZ2UnLCAoZDogc3RyaW5nKSA9PiB0aGlzLm9uV3NNZXNzYWdlKGQsIHRoaXMpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uV3NDb25uZWN0ZWQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ29ubmVjdGVkXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Xc01lc3NhZ2UobWVzc2FnZTogc3RyaW5nLCBwbGF5ZXI6IFBsYXllcik6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgTWVzc2FnZTogJHttZXNzYWdlfWApO1xuICAgICAgICBjb25zdCBbY29tbWFuZCwgZGF0YV0gPSBtZXNzYWdlLnNwbGl0KFwiIFwiKTtcbiAgICAgICAgY29uc29sZS5sb2coY29tbWFuZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICBzd2l0Y2goY29tbWFuZCkge1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlcy5QTEFZLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQTEFZIENPTU1BTkQgUkVDRUlWRURcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocGxheWVyKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIueXRQbGF5ZXIucGxheVZpZGVvKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VzLlBBVVNFLnRvU3RyaW5nKCk6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQQVVTRSBDT01NQU5EIFJFQ0VJVkVEXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBsYXllcik7XG4gICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZXMuU0VFSy50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU0VFSyBDT01NQU5EIFJFQ0VJVkVEXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBsYXllcik7XG4gICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnNlZWtUbyhwYXJzZUZsb2F0KGRhdGEpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgfVxuXG59IiwiaW1wb3J0IFBsYXllciBmcm9tIFwiLi9wbGF5ZXJcIjtcbmltcG9ydCB7IGluamVjdFl0UmVuZGVyZWRCdXR0b24sIGNyZWF0ZVBsdXNJY29uIH0gZnJvbSBcIi4vdXRpbC95dC1odG1sXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZVJvb21JZCB9IGZyb20gXCIuL3V0aWwvd2Vic29ja2V0XCI7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgIGNvbnN0IHBsYXllciA9IG5ldyBQbGF5ZXIoe1xuICAgICAgICBjb25uZWN0aW9uOiB7XG4gICAgICAgICAgICBwcm90b2NvbDogJ2h0dHAnLFxuICAgICAgICAgICAgaG9zdDogJzEyNy4wLjAuMScsXG4gICAgICAgICAgICBwb3J0OiAnODA4MCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgdmlkZW9JZCA9IHVybFBhcmFtcy5nZXQoJ3YnKTtcbiAgICBjb25zdCByb29tSWQgPSB1cmxQYXJhbXMuZ2V0KCdzeW5jSWQnKTtcblxuICAgIGlmIChyb29tSWQgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgaW5qZWN0U3luY0J1dHRvbkludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCQoXCJkaXYjaW5mbyB5dGQtbWVudS1yZW5kZXJlciBkaXYjdG9wLWxldmVsLWJ1dHRvbnNcIikpIHtcbiAgICAgICAgICAgICAgICBpbmplY3RZdFJlbmRlcmVkQnV0dG9uKFwiZGl2I2luZm8geXRkLW1lbnUtcmVuZGVyZXIgZGl2I3RvcC1sZXZlbC1idXR0b25zXCIsIFwiY3JlYXRlLXN5bmMtYnV0dG9uXCIsIFwiQ3JlYXRlIFN5bmNcIiwgY3JlYXRlUGx1c0ljb24oKSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBySWQgPSBnZW5lcmF0ZVJvb21JZCgpO1xuICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXMuc2V0KCdzeW5jSWQnLCBySWQpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uc2VhcmNoID0gdXJsUGFyYW1zLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVcGRhdGVzIFF1ZXJ5IFBhcmFtczogJHtySWR9YCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbmplY3RTeW5jQnV0dG9uSW50ZXJ2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCA1MDApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcGxheWVyLmNyZWF0ZSh2aWRlb0lkLCByb29tSWQpO1xuICAgIH1cbn07IiwiZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUm9vbUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSkgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpO1xufSIsImV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQbHVzSWNvbigpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgXG4gICAgICAgIDxzdmdcbiAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgICAgcHJlc2VydmVBc3BlY3RSYXRpbz1cInhNaWRZTWlkIG1lZXRcIlxuICAgICAgICAgICAgZm9jdXNhYmxlPVwiZmFsc2VcIlxuICAgICAgICAgICAgY2xhc3M9XCJzdHlsZS1zY29wZSB5dC1pY29uXCJcbiAgICAgICAgICAgIHN0eWxlPVwicG9pbnRlci1ldmVudHM6IG5vbmU7IGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlO1wiXG4gICAgICAgID5cbiAgICAgICAgICAgIDxnIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTkgMTNoLTZ2NmgtMnYtNkg1di0yaDZWNWgydjZoNnYyelwiIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiIC8+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgIDwvc3ZnPlxuICAgIGApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEljb25TaGVsbCgpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWljb24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIgLz5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uQnV0dG9uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uLWJ1dHRvbiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiBpZD1cImJ1dHRvblwiPmApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdEZvcm1hdHRlZFN0cmluZyhjYjogKCkgPT4gdm9pZCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtZm9ybWF0dGVkLXN0cmluZyBpZD1cInRleHRcIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0ZC1idXR0b24tcmVuZGVyZXIgc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiAvPmApXG4gICAgICAgIC5jbGljayhjYik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0UmVuZGVyZWRCdXR0b25Db250YWluZXIoaWQ6IHN0cmluZyk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1idXR0b24tcmVuZGVyZXIgaWQ9XCIke2lkfVwiIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLW1lbnUtcmVuZGVyZXIgZm9yY2UtaWNvbi1idXR0b24gc3R5bGUtZGVmYXVsdCBzaXplLWRlZmF1bHRcIiBidXR0b24tcmVuZGVyZXI9XCJcIiB1c2Uta2V5Ym9hcmQtZm9jdXNlZD1cIlwiIGlzLWljb24tYnV0dG9uPVwiXCIgLz5cbiAgICBgKTtcbn1cblxuLyoqXG4gKiBJbmplY3QgYSBZdFJlbmRlcmVkQnV0dG9uIGludG8gYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIG9iaklkIFRoZSBJZCBvZiB0aGUgb2JqZWN0IHRoZSBZdFJlbmRlcmVkQnV0dG9uIHNob3VsZCBiZSBpbmplY3RlZCB0b1xuICogQHBhcmFtIHRleHQgVGhlIHRleHQgb2YgdGhlIGJ1dHRvblxuICogQHBhcmFtIGljb24gVGhlIGljb24gb2YgdGhlIGJ1dHRvbiAobmVlZHMgdG8gYmUgYSBzdmcgRWxlbWVudClcbiAqIEBwYXJhbSBjYiBUaGUgZnVuY3Rpb24gdGhhdCBzaG91bGQgYmUgY2FsbGVkIG9uIGJ1dHRvbiBjbGlja1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbihvYmpJZDogc3RyaW5nLCBjb250YWluZXJJZDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcsIGljb246IEpRdWVyeTxIVE1MRWxlbWVudD4sIGNiOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgLy8gVGhlIGNvbXBsZXRlIGJ1dHRvbiBuZWVkcyB0byBiZSBpbmplY3RlZCBleGFjdGx5IGxpa2UgdGhpc1xuICAgIC8vIGJlY2F1c2Ugd2hlbiB3ZSBpbmplY3QgdGhlIGNvbXBsZXRlbHkgYnVpbGQgYnV0dG9uXG4gICAgLy8gWVQgcmVtb3ZlcyBhbGwgaXRzIGNvbnRlbnQgc28gd2UgbmVlZCB0byBwYXJ0aWFsbHkgaW5qZWN0XG4gICAgLy8gZXZlcnl0aGluZyBpbiBvcmRlciB0byBnZXQgaXQgdG8gd29ya1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGNyZWF0ZVl0UmVuZGVyZWRCdXR0b25Db250YWluZXIoY29udGFpbmVySWQpO1xuICAgICQob2JqSWQpXG4gICAgICAgIC5hcHBlbmQoY29udGFpbmVyKTtcblxuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAkKGEpXG4gICAgICAgIC5hZGRDbGFzcyhcInl0LXNpbXBsZS1lbmRwb2ludCBzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIpXG4gICAgICAgIC5hdHRyKFwidGFiaW5kZXhcIiwgLTEpO1xuXG4gICAgJChjb250YWluZXIpXG4gICAgICAgIC5hcHBlbmQoYSk7XG5cbiAgICBjb25zdCBpY29uQnV0dG9uID0gY3JlYXRlWXRJY29uQnV0dG9uU2hlbGwoKTtcbiAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBjcmVhdGVZdEZvcm1hdHRlZFN0cmluZyhjYik7XG4gICAgJChhKVxuICAgICAgICAuYXBwZW5kKGljb25CdXR0b24pXG4gICAgICAgIC5hcHBlbmQoZm9ybWF0dGVkU3RyaW5nKTtcblxuICAgICQoZm9ybWF0dGVkU3RyaW5nKVxuICAgICAgICAudGV4dCh0ZXh0KTtcblxuICAgIGNvbnN0IGljb25TaGVsbCA9IGNyZWF0ZVl0SWNvblNoZWxsKCk7XG4gICAgJChpY29uQnV0dG9uKS5maW5kKFwiYnV0dG9uI2J1dHRvblwiKVxuICAgICAgICAuYXBwZW5kKGljb25TaGVsbClcbiAgICAgICAgLmNsaWNrKGNiKTtcblxuICAgICQoaWNvblNoZWxsKVxuICAgICAgICAuYXBwZW5kKGljb24pO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==