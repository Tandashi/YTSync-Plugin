import Player from "./player";
import * as ytHTML from "./util/yt-html";
import { generateSessionId } from "./util/websocket";
import { SessionId } from "./util/consts";
import { startUrlChangeCheck } from "./util/schedule";

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const intervals = {
        syncButton: null,
        leaveButton: null,
        removeUpnext: null,
        queue: null
    };

    const player = new Player({
        connection: {
            protocol: 'http',
            host: '127.0.0.1',
            port: '8080'
        }
    });

    const videoId = urlParams.get('v');
    const sessionId = urlParams.get(SessionId);

    if (sessionId === null) {
        intervals.syncButton = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                ytHTML.injectYtRenderedButton($("div#info ytd-menu-renderer div#top-level-buttons"), "create-sync-button", "Create Sync", ytHTML.createPlusIcon(), () => {
                    urlParams.set(SessionId, generateSessionId());
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
                    urlParams.delete(SessionId);
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