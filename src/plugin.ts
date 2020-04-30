import Player from "./player";
import { injectYtRenderedButton, createPlusIcon } from "./util/yt-html";

window.onload = () => {
    const player = new Player({
        serverURL: "localhost:8080"
    });

    const injectSyncButtonInterval = setInterval(() => {
        if ($("div#info ytd-menu-renderer div#top-level-buttons")) {
            injectYtRenderedButton("div#info ytd-menu-renderer div#top-level-buttons", "Create Sync", createPlusIcon(), () => player.create());
            clearInterval(injectSyncButtonInterval);
        }
    }, 500);
};