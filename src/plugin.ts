import Player from "./player";
import { injectYtRenderedButton, createPlusIcon } from "./util/yt-html";
import { generateRoomId } from "./util/websocket";

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
    const roomId = urlParams.get('syncId');

    if (roomId === null) {
        const injectSyncButtonInterval = setInterval(() => {
            if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
                injectYtRenderedButton("div#info ytd-menu-renderer div#top-level-buttons", "create-sync-button", "Create Sync", createPlusIcon(), () => {
                    const rId = generateRoomId();
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