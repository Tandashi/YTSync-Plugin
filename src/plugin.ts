import YTHTMLUtil from './util/yt-html';
import { QUEUE_ADD_BUTTON_ID, CREATE_SYNC_BUTTON_ID, STORAGE_SESSION_ID, LEAVE_SYNC_BUTTON_ID, BUTTON_INJECT_CONTAINER_SELECTOR } from './util/consts';
import Player from './player';
import WebsocketUtil from './util/websocket';
import Store from './util/store';
import VideoUtil from './util/video';
import ScheduleUtil from './util/schedule';
import ClipboardUtil from './util/clipboard';

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

// tslint:disable-next-line: no-empty
let urlSchedule: () => void = () => { };

window.onload = () => {
  urlSchedule = ScheduleUtil.startUrlChangeSchedule(urlChangeHandler);
  urlChangeHandler();
};

window.onunload = () => {
  urlSchedule();
  clearIntervals();
};

function clearIntervals(): void {
  Object.values(intervals).forEach((i) => {
    try {
      clearInterval(i);
    }
    // tslint:disable-next-line: no-empty
    catch (_) { }
  });
}

/**
 * Handler for URL changes.
 * Will inject needed elements accordignly.
 */
function urlChangeHandler(): void {
  clearIntervals();

  const urlParams = new URLSearchParams(window.location.search);

  const videoId = urlParams.get('v');
  if (videoId === null)
    return;

  const sessionId = urlParams.get(STORAGE_SESSION_ID);
  if (sessionId === null) {
    startInjectingNonSessionItems(urlParams);
  }
  else {
    startInjectingSessionItems(urlParams, sessionId);
  }
}

/**
 * Inject all elements needed when not in a session
 *
 * @param urlParams The current window url parameters
 */
function startInjectingNonSessionItems(urlParams: URLSearchParams): void {
  intervals.syncButton = injectButton(CREATE_SYNC_BUTTON_ID, 'Create Sync', YTHTMLUtil.createPlusIcon(), () => {
    urlParams.set(STORAGE_SESSION_ID, WebsocketUtil.generateSessionId());
    window.location.search = urlParams.toString();
    ClipboardUtil.writeText(`${window.location.protocol}//${window.location.host}${window.location.pathname}?${urlParams}`);
  });

  intervals.queueAddButton = injectButton(QUEUE_ADD_BUTTON_ID, 'Add to Queue', YTHTMLUtil.createPlusIcon(), () => {
    Store.addElement(VideoUtil.getCurrentVideo());
  });
}

/**
 * Inject all elements needed when in a session
 *
 * @param urlParams The current window url parameters
 * @param sessionId The session id
 */
function startInjectingSessionItems(urlParams: URLSearchParams, sessionId: string): void {
  intervals.leaveButton = injectButton(LEAVE_SYNC_BUTTON_ID, 'Leave Sync', YTHTMLUtil.createLeaveIcon(), () => {
    urlParams.delete(STORAGE_SESSION_ID);
    window.location.search = urlParams.toString();
  });

  player.create(sessionId);
}

/**
 * Inject a button into the #top-level-buttons of the ytd-video-primary-info-renderer
 *
 * @param id The id of the button
 * @param text The text of the button
 * @param icon The icon of the button
 * @param cb The function that should be called when the button was clicked
 */
function injectButton(id: string, text: string, icon: JQuery<HTMLElement>, cb: () => void): NodeJS.Timeout {
  const handler = setInterval(() => {
    const container = $(BUTTON_INJECT_CONTAINER_SELECTOR);
    $(`ytd-button-renderer#${id}`).remove();
    if (container.length === 1 && container.find(`#${id}`).length === 0) {
      YTHTMLUtil.injectYtRenderedButton(container, id, text, icon, cb);
      clearInterval(handler);
    }
  }, 500);

  return handler;
}