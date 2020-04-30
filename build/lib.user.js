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
    create() {
        const urlParams = new URLSearchParams(window.location.search);
        this.ytPlayer = new window.YT.Player('ytd-player', {
            width: "100%",
            height: "100%",
            videoId: urlParams.get("v"),
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
        this.ws = new WebSocket(`ws:${this.options.serverURL}`);
        this.ws.onopen = () => console.log("connected");
        this.ws.onmessage = (m) => this.onMessage(m, this);
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
    onMessage(message, player) {
        console.log(`Message: ${message.data}`);
        const [command, data] = message.data.split(" ");
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
window.onload = () => {
    const player = new player_1.default({
        serverURL: "localhost:8080"
    });
    const injectSyncButtonInterval = setInterval(() => {
        if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
            yt_html_1.injectYtRenderedButton("div#info ytd-menu-renderer div#top-level-buttons", "Create Sync", yt_html_1.createPlusIcon(), () => player.create());
            clearInterval(injectSyncButtonInterval);
        }
    }, 500);
};


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
function createYtRenderedButtonContainer() {
    return $(`
        <ytd-button-renderer class="style-scope ytd-menu-renderer force-icon-button style-default size-default" button-renderer="" use-keyboard-focused="" is-icon-button="" />
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
function injectYtRenderedButton(objId, text, icon, cb) {
    // The complete button needs to be injected exactly like this
    // because when we inject the completely build button
    // YT removes all its content so we need to partially inject
    // everything in order to get it to work
    const container = createYtRenderedButtonContainer();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGx1Z2luLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlsL3l0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDMUVBLElBQUssUUFJSjtBQUpELFdBQUssUUFBUTtJQUNULHlCQUFhO0lBQ2IsMkJBQWU7SUFDZix5QkFBYTtBQUNqQixDQUFDLEVBSkksUUFBUSxLQUFSLFFBQVEsUUFJWjtBQUVELE1BQXFCLE1BQU07SUFLdkIsWUFBWSxPQUFzQjtRQUM5QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRU0sTUFBTTtRQUNULE1BQU0sU0FBUyxHQUFHLElBQUksZUFBZSxD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QVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7U0FDOUIsTUFBTSxDQUFDLFNBQVMsQ0FBQztTQUNqQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFZixDQUFDLENBQUMsU0FBUyxDQUFDO1NBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFqQ0Qsd0RBaUNDIiwiZmlsZSI6ImxpYi51c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvcGx1Z2luLnRzXCIpO1xuIiwiZGVjbGFyZSBnbG9iYWwge1xuICAgIGludGVyZmFjZSBXaW5kb3cgeyBjdWN1OiBhbnk7IH1cbn1cblxuaW50ZXJmYWNlIFBsYXllck9wdGlvbnMge1xuICAgIHNlcnZlclVSTDogc3RyaW5nO1xufVxuXG5lbnVtIE1lc3NhZ2VzIHtcbiAgICBQTEFZID0gXCJwbGF5XCIsXG4gICAgUEFVU0UgPSBcInBhdXNlXCIsXG4gICAgU0VFSyA9IFwic2Vla1wiXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XG4gICAgcHJpdmF0ZSB5dFBsYXllcjogWVQuUGxheWVyO1xuICAgIHB1YmxpYyB3czogV2ViU29ja2V0O1xuICAgIHByaXZhdGUgb3B0aW9uczogUGxheWVyT3B0aW9ucztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFBsYXllck9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlKCkge1xuICAgICAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgd2luZG93LllULlBsYXllcigneXRkLXBsYXllcicsIHtcbiAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICB2aWRlb0lkOiB1cmxQYXJhbXMuZ2V0KFwidlwiKSxcbiAgICAgICAgICAgIHBsYXllclZhcnM6IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogXCJyZWRcIixcbiAgICAgICAgICAgICAgICBhdXRvcGxheTogWVQuQXV0b1BsYXkuQXV0b1BsYXlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICAgICBvblJlYWR5OiAoZSkgPT4gdGhpcy5vblJlYWR5KGUpLFxuICAgICAgICAgICAgICAgIG9uU3RhdGVDaGFuZ2U6IChlKSA9PiB0aGlzLm9uU3RhdGVDaGFuZ2UoZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmN1Y3UgPSB7fTtcbiAgICAgICAgd2luZG93LmN1Y3UucGxheWVyID0gdGhpcy55dFBsYXllcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmVhZHkoXzogWVQuUGxheWVyRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy55dFBsYXllci5wYXVzZVZpZGVvKCk7XG4gICAgICAgIHRoaXMud3MgPSBuZXcgV2ViU29ja2V0KGB3czoke3RoaXMub3B0aW9ucy5zZXJ2ZXJVUkx9YCk7XG4gICAgICAgIHRoaXMud3Mub25vcGVuID0gKCkgPT4gY29uc29sZS5sb2coXCJjb25uZWN0ZWRcIik7XG4gICAgICAgIHRoaXMud3Mub25tZXNzYWdlID0gKG0pID0+IHRoaXMub25NZXNzYWdlKG0sIHRoaXMpO1xuXG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI5MjkzODc3L2hvdy10by1saXN0ZW4tdG8tc2Vlay1ldmVudC1pbi15b3V0dWJlLWVtYmVkLWFwaVxuICAgICAgICBsZXQgbGFzdFRpbWUgPSAtMTtcbiAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSAxMDAwO1xuXG4gICAgICAgIGNvbnN0IGNoZWNrUGxheWVyVGltZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChsYXN0VGltZSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLnl0UGxheWVyLmdldFBsYXllclN0YXRlKCkgPT09IHdpbmRvdy5ZVC5QbGF5ZXJTdGF0ZS5QTEFZSU5HICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lID0gdGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGV4cGVjdGluZyAxIHNlY29uZCBpbnRlcnZhbCAsIHdpdGggNTAwIG1zIG1hcmdpblxuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnModGltZSAtIGxhc3RUaW1lIC0gMSkgPiAwLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZXJlIHdhcyBhIHNlZWsgb2NjdXJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25QbGF5ZXJTZWVrKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0VGltZSA9IHRoaXMueXRQbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tQbGF5ZXJUaW1lLCBpbnRlcnZhbCk7IC8vIHJlcGVhdCBmdW5jdGlvbiBjYWxsIGluIDEgc2Vjb25kXG4gICAgICAgIH07XG5cbiAgICAgICAgc2V0VGltZW91dChjaGVja1BsYXllclRpbWUsIGludGVydmFsKTsgLy8gaW5pdGlhbCBjYWxsIGRlbGF5ZWRcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RhdGVDaGFuZ2UoZXZlbnQ6IFlULk9uU3RhdGVDaGFuZ2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgTmV3IFN0YXRlICR7ZXZlbnQuZGF0YX1gKTtcbiAgICAgICAgc3dpdGNoKGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIGNhc2Ugd2luZG93LllULlBsYXllclN0YXRlLlBMQVlJTkc6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coTWVzc2FnZXMuUExBWSk7XG4gICAgICAgICAgICAgICAgdGhpcy53cy5zZW5kKE1lc3NhZ2VzLlBMQVkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB3aW5kb3cuWVQuUGxheWVyU3RhdGUuUEFVU0VEOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKE1lc3NhZ2VzLlBBVVNFKTtcbiAgICAgICAgICAgICAgICB0aGlzLndzLnNlbmQoTWVzc2FnZXMuUEFVU0UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblBsYXllclNlZWsoKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke01lc3NhZ2VzLlNFRUt9ICR7dGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpfWApO1xuICAgICAgICB0aGlzLndzLnNlbmQoYCR7TWVzc2FnZXMuU0VFS30gJHt0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCl9YCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZUV2ZW50LCBwbGF5ZXI6IFBsYXllcik6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgTWVzc2FnZTogJHttZXNzYWdlLmRhdGF9YCk7XG4gICAgICAgIGNvbnN0IFtjb21tYW5kLCBkYXRhXSA9IG1lc3NhZ2UuZGF0YS5zcGxpdChcIiBcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKGNvbW1hbmQpO1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgc3dpdGNoKGNvbW1hbmQpIHtcbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZXMuUExBWS50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUExBWSBDT01NQU5EIFJFQ0VJVkVEXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBsYXllcik7XG4gICAgICAgICAgICAgICAgcGxheWVyLnl0UGxheWVyLnBsYXlWaWRlbygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlcy5QQVVTRS50b1N0cmluZygpOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUEFVU0UgQ09NTUFORCBSRUNFSVZFRFwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwbGF5ZXIpO1xuICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5wYXVzZVZpZGVvKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VzLlNFRUsudG9TdHJpbmcoKTpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRUsgQ09NTUFORCBSRUNFSVZFRFwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwbGF5ZXIpO1xuICAgICAgICAgICAgICAgIHBsYXllci55dFBsYXllci5zZWVrVG8ocGFyc2VGbG9hdChkYXRhKSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgIH1cblxufSIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4vcGxheWVyXCI7XG5pbXBvcnQgeyBpbmplY3RZdFJlbmRlcmVkQnV0dG9uLCBjcmVhdGVQbHVzSWNvbiB9IGZyb20gXCIuL3V0aWwveXQtaHRtbFwiO1xuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICAgIGNvbnN0IHBsYXllciA9IG5ldyBQbGF5ZXIoe1xuICAgICAgICBzZXJ2ZXJVUkw6IFwibG9jYWxob3N0OjgwODBcIlxuICAgIH0pO1xuXG4gICAgY29uc3QgaW5qZWN0U3luY0J1dHRvbkludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAoJChcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiKSkge1xuICAgICAgICAgICAgaW5qZWN0WXRSZW5kZXJlZEJ1dHRvbihcImRpdiNpbmZvIHl0ZC1tZW51LXJlbmRlcmVyIGRpdiN0b3AtbGV2ZWwtYnV0dG9uc1wiLCBcIkNyZWF0ZSBTeW5jXCIsIGNyZWF0ZVBsdXNJY29uKCksICgpID0+IHBsYXllci5jcmVhdGUoKSk7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGluamVjdFN5bmNCdXR0b25JbnRlcnZhbCk7XG4gICAgICAgIH1cbiAgICB9LCA1MDApO1xufTsiLCJleHBvcnQgZnVuY3Rpb24gY3JlYXRlUGx1c0ljb24oKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYFxuICAgICAgICA8c3ZnXG4gICAgICAgICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgICAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW89XCJ4TWlkWU1pZCBtZWV0XCJcbiAgICAgICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgICAgIGNsYXNzPVwic3R5bGUtc2NvcGUgeXQtaWNvblwiXG4gICAgICAgICAgICBzdHlsZT1cInBvaW50ZXItZXZlbnRzOiBub25lOyBkaXNwbGF5OiBibG9jazsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTtcIlxuICAgICAgICA+XG4gICAgICAgICAgICA8ZyBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIj5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTE5IDEzaC02djZoLTJ2LTZINXYtMmg2VjVoMnY2aDZ2MnpcIiBjbGFzcz1cInN0eWxlLXNjb3BlIHl0LWljb25cIiAvPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICA8L3N2Zz5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRJY29uU2hlbGwoKTogSlF1ZXJ5PEhUTUxFbGVtZW50PiB7XG4gICAgcmV0dXJuICQoYDx5dC1pY29uIGNsYXNzPVwic3R5bGUtc2NvcGUgeXRkLWJ1dHRvbi1yZW5kZXJlclwiIC8+YCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVl0SWNvbkJ1dHRvblNoZWxsKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGA8eXQtaWNvbi1idXR0b24gY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgaWQ9XCJidXR0b25cIj5gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWXRGb3JtYXR0ZWRTdHJpbmcoY2I6ICgpID0+IHZvaWQpOiBKUXVlcnk8SFRNTEVsZW1lbnQ+IHtcbiAgICByZXR1cm4gJChgPHl0LWZvcm1hdHRlZC1zdHJpbmcgaWQ9XCJ0ZXh0XCIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyIHN0eWxlLWRlZmF1bHQgc2l6ZS1kZWZhdWx0XCIgLz5gKVxuICAgICAgICAuY2xpY2soY2IpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVZdFJlbmRlcmVkQnV0dG9uQ29udGFpbmVyKCk6IEpRdWVyeTxIVE1MRWxlbWVudD4ge1xuICAgIHJldHVybiAkKGBcbiAgICAgICAgPHl0ZC1idXR0b24tcmVuZGVyZXIgY2xhc3M9XCJzdHlsZS1zY29wZSB5dGQtbWVudS1yZW5kZXJlciBmb3JjZS1pY29uLWJ1dHRvbiBzdHlsZS1kZWZhdWx0IHNpemUtZGVmYXVsdFwiIGJ1dHRvbi1yZW5kZXJlcj1cIlwiIHVzZS1rZXlib2FyZC1mb2N1c2VkPVwiXCIgaXMtaWNvbi1idXR0b249XCJcIiAvPlxuICAgIGApO1xufVxuXG4vKipcbiAqIEluamVjdCBhIFl0UmVuZGVyZWRCdXR0b24gaW50byBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gb2JqSWQgVGhlIElkIG9mIHRoZSBvYmplY3QgdGhlIFl0UmVuZGVyZWRCdXR0b24gc2hvdWxkIGJlIGluamVjdGVkIHRvXG4gKiBAcGFyYW0gdGV4dCBUaGUgdGV4dCBvZiB0aGUgYnV0dG9uXG4gKiBAcGFyYW0gaWNvbiBUaGUgaWNvbiBvZiB0aGUgYnV0dG9uIChuZWVkcyB0byBiZSBhIHN2ZyBFbGVtZW50KVxuICogQHBhcmFtIGNiIFRoZSBmdW5jdGlvbiB0aGF0IHNob3VsZCBiZSBjYWxsZWQgb24gYnV0dG9uIGNsaWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RZdFJlbmRlcmVkQnV0dG9uKG9iaklkOiBzdHJpbmcsIHRleHQ6IHN0cmluZywgaWNvbjogSlF1ZXJ5PEhUTUxFbGVtZW50PiwgY2I6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICAvLyBUaGUgY29tcGxldGUgYnV0dG9uIG5lZWRzIHRvIGJlIGluamVjdGVkIGV4YWN0bHkgbGlrZSB0aGlzXG4gICAgLy8gYmVjYXVzZSB3aGVuIHdlIGluamVjdCB0aGUgY29tcGxldGVseSBidWlsZCBidXR0b25cbiAgICAvLyBZVCByZW1vdmVzIGFsbCBpdHMgY29udGVudCBzbyB3ZSBuZWVkIHRvIHBhcnRpYWxseSBpbmplY3RcbiAgICAvLyBldmVyeXRoaW5nIGluIG9yZGVyIHRvIGdldCBpdCB0byB3b3JrXG4gICAgY29uc3QgY29udGFpbmVyID0gY3JlYXRlWXRSZW5kZXJlZEJ1dHRvbkNvbnRhaW5lcigpO1xuICAgICQob2JqSWQpXG4gICAgICAgIC5hcHBlbmQoY29udGFpbmVyKTtcblxuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAkKGEpXG4gICAgICAgIC5hZGRDbGFzcyhcInl0LXNpbXBsZS1lbmRwb2ludCBzdHlsZS1zY29wZSB5dGQtYnV0dG9uLXJlbmRlcmVyXCIpXG4gICAgICAgIC5hdHRyKFwidGFiaW5kZXhcIiwgLTEpO1xuXG4gICAgJChjb250YWluZXIpXG4gICAgICAgIC5hcHBlbmQoYSk7XG5cbiAgICBjb25zdCBpY29uQnV0dG9uID0gY3JlYXRlWXRJY29uQnV0dG9uU2hlbGwoKTtcbiAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBjcmVhdGVZdEZvcm1hdHRlZFN0cmluZyhjYik7XG4gICAgJChhKVxuICAgICAgICAuYXBwZW5kKGljb25CdXR0b24pXG4gICAgICAgIC5hcHBlbmQoZm9ybWF0dGVkU3RyaW5nKTtcblxuICAgICQoZm9ybWF0dGVkU3RyaW5nKVxuICAgICAgICAudGV4dCh0ZXh0KTtcblxuICAgIGNvbnN0IGljb25TaGVsbCA9IGNyZWF0ZVl0SWNvblNoZWxsKCk7XG4gICAgJChpY29uQnV0dG9uKS5maW5kKFwiYnV0dG9uI2J1dHRvblwiKVxuICAgICAgICAuYXBwZW5kKGljb25TaGVsbClcbiAgICAgICAgLmNsaWNrKGNiKTtcblxuICAgICQoaWNvblNoZWxsKVxuICAgICAgICAuYXBwZW5kKGljb24pO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==