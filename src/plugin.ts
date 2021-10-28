import {
  QUEUE_ADD_BUTTON_ID,
  CREATE_SYNC_BUTTON_ID,
  LEAVE_SYNC_BUTTON_ID,
  BUTTON_INJECT_CONTAINER_SELECTOR,
} from './util/consts';
import Player from './player';
import WebsocketUtil from './util/websocket';
import Store from './util/store';
import VideoUtil from './util/video';
import ScheduleUtil from './util/schedule';
import ClipboardUtil from './util/clipboard';
import { createPlusIcon, createLeaveIcon } from './util/yt-html/svg';
import { injectYtRenderedButton } from './util/yt-html/button';
import URLUtil from './util/url';
import { createToast } from './util/yt-html/toast';

const intervals: PluginInjectIntervals = {
  syncButton: null,
  leaveButton: null,
  removeUpnext: null,
  queueInject: null,
  queueAddButton: null,
};

const player = new Player({
  connection: {
    protocol: 'https',
    host: 'sync.tandashi.de',
    port: '443',
  },
});

// tslint:disable-next-line: no-empty
let urlSchedule: () => void = () => {};

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
    } catch (_) {
      // tslint:disable-next-line: no-empty
    }
  });
}

/**
 * Handler for URL changes.
 * Will inject needed elements accordignly.
 */
function urlChangeHandler(): void {
  clearIntervals();

  const videoId = URLUtil.getVideoId();
  if (videoId === null) return;

  const sessionId = URLUtil.getSessionId();
  if (sessionId === null) {
    startInjectingNonSessionItems();
  } else {
    startInjectingSessionItems(sessionId);
  }
}

/**
 * Inject all elements needed when not in a session
 *
 * @param urlParams The current window url parameters
 */
function startInjectingNonSessionItems(): void {
  intervals.syncButton = injectButton(CREATE_SYNC_BUTTON_ID, 0, 'Create Sync', createPlusIcon(), () => {
    const sessionId = WebsocketUtil.generateSessionId();
    location.hash = sessionId;

    ClipboardUtil.writeText(
      `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}#${sessionId}`
    );
    createToast('Sync Links copied to clipboard');
  });

  intervals.queueAddButton = injectButton(QUEUE_ADD_BUTTON_ID, 1, 'Add to Queue', createPlusIcon(), () => {
    Store.addElement(VideoUtil.getCurrentVideo());
    createToast('Video Added to Sync Queue');
  });
}

/**
 * Inject all elements needed when in a session
 *
 * @param urlParams The current window url parameters
 * @param sessionId The session id
 */
function startInjectingSessionItems(sessionId: string): void {
  intervals.leaveButton = injectButton(LEAVE_SYNC_BUTTON_ID, 0, 'Leave Sync', createLeaveIcon(), () => {
    // No leave possible currently
    location.hash = '';
  });

  player.create(sessionId);
}

/**
 * Inject a button into the #top-level-buttons of the ytd-video-primary-info-renderer
 *
 * @param id The id of the button
 * @param insertAfter The index of the object we want to inject the button after
 * @param text The text of the button
 * @param icon The icon of the button
 * @param cb The function that should be called when the button was clicked
 */
function injectButton(
  id: string,
  insertAfter: number,
  text: string,
  icon: JQuery<HTMLElement>,
  cb: () => void
): NodeJS.Timeout {
  const handler = setInterval(() => {
    const container = $(BUTTON_INJECT_CONTAINER_SELECTOR);
    $(`ytd-button-renderer#${id}`).remove();
    if (container.length === 1 && container.find(`#${id}`).length === 0) {
      injectYtRenderedButton(container, insertAfter, id, text, icon, cb);
      clearInterval(handler);
    }
  }, 500);

  return handler;
}
