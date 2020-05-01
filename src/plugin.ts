import Player from "./player";
import * as ytHTML from "./util/yt-html";
import { generateSessionId } from "./util/websocket";
import { SessionId } from "./util/consts";

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
        player.create(videoId, sessionId);
        intervals.leaveButton = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                ytHTML.injectYtRenderedButton($("div#info ytd-menu-renderer div#top-level-buttons"), "create-sync-button", "Leave Sync", ytHTML.createLeaveIcon(), () => {
                    urlParams.delete(SessionId);
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