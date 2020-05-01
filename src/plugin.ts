import Player from "./player";
import { injectYtRenderedButton, createPlusIcon, createLeaveIcon } from "./util/yt-html";
import { generateSessionId } from "./util/websocket";
import { SessionId } from "./util/consts";

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);

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
        const injectSyncButtonInterval = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                injectYtRenderedButton("div#info ytd-menu-renderer div#top-level-buttons", "create-sync-button", "Create Sync", createPlusIcon(), () => {
                    urlParams.set(SessionId, generateSessionId());
                    window.location.search = urlParams.toString();
                });
                clearInterval(injectSyncButtonInterval);
            }
        }, 500);
    }
    else {
        player.create(videoId, sessionId);
        const injectLeaveButtonInterval = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                injectYtRenderedButton("div#info ytd-menu-renderer div#top-level-buttons", "create-sync-button", "Leave Sync", createLeaveIcon(), () => {
                    urlParams.delete(SessionId);
                    window.location.search = urlParams.toString();
                });
                clearInterval(injectLeaveButtonInterval);
            }
        }, 500);
    }
};