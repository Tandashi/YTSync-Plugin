import * as ytHTML from './util/yt-html';
import * as Consts from './util/consts';
import Player from './player';
import WebsocketUtil from './util/websocket';
import Store from './util/store';
import VideoUtil from './util/video';
import ScheduleUtil from './util/schedule';

const intervals: PluginInjectIntervals = {
    syncButton: null,
    leaveButton: null,
    removeUpnext: null,
    queueInject: null,
    queueAddButton: null
};

const player = new Player({
    connection: {
        protocol: 'https',
        host: 'sync.tandashi.de',
        port: '443'
    }
});

let urlSchedule: () => void;

window.onload = () => {
    urlSchedule = ScheduleUtil.startUrlChangeSchedule(urlChangeHandler);
    urlChangeHandler();
};

window.onunload = () => {
    urlSchedule();

    Object.values(intervals).forEach((i) => {
        try {
            clearInterval(i);
        }
        // tslint:disable-next-line: no-empty
        catch(_) {}
    });
};

function urlChangeHandler(): void {
    const urlParams = new URLSearchParams(window.location.search);

    const videoId = urlParams.get('v');
    if (videoId === null)
        return;

    const sessionId = urlParams.get(Consts.SessionId);
    if (sessionId === null) {
        startInjectingNonSessionItems(urlParams);
    }
    else {
        startInjectingSessionItems(urlParams, videoId, sessionId);
    }
}

function startInjectingNonSessionItems(urlParams: URLSearchParams) {
    intervals.syncButton = injectButton(Consts.CreateSyncButtonId, 'Create Sync', ytHTML.createPlusIcon(), () => {
        urlParams.set(Consts.SessionId, WebsocketUtil.generateSessionId());
        window.location.search = urlParams.toString();
    });

    intervals.queueAddButton = injectButton(Consts.QueueAddButtonId, 'Add to Queue', ytHTML.createPlusIcon(), () => {
        Store.addElement(VideoUtil.getCurrentVideo());
    });
}

function startInjectingSessionItems(urlParams: URLSearchParams, videoId: string, sessionId: string) {
    intervals.leaveButton = injectButton(Consts.LeaveSyncButtonId, 'Leave Sync', ytHTML.createLeaveIcon(), () => {
        urlParams.delete(Consts.SessionId);
        window.location.search = urlParams.toString();
    });

    intervals.removeUpnext = setInterval(() => {
        if ($('ytd-compact-autoplay-renderer.ytd-watch-next-secondary-results-renderer')) {
            ytHTML.removeUpnext();
            clearInterval(intervals.removeUpnext);
        }
    }, 500);

    intervals.queueInject = setInterval(() => {
        if ($('div#secondary #playlist')) {
            player.create(videoId, sessionId);
            clearInterval(intervals.queueInject);
        }
    }, 500);
}

function injectButton(id: string, text: string, icon: JQuery<HTMLElement>, cb: () => void): NodeJS.Timeout {
    const handler = setInterval(() => {
        const container = $('div#info ytd-menu-renderer div#top-level-buttons');
        if (container.length === 1 && container.find(`#${id}`).length === 0) {
            ytHTML.injectYtRenderedButton(container, id, text, icon, cb);
            clearInterval(handler);
        }
    }, 500);

    return handler;
}