import {
  QUEUE_ADD_BUTTON_ID,
  CREATE_SYNC_BUTTON_ID,
  LEAVE_SYNC_BUTTON_ID,
  VIDEO_INFO_BUTTON_INJECT_CONTAINER_SELECTOR,
  VIDEO_PLAYLIST_BUTTON_INJECT_CONTAINER_SELECTOR,
  PLAYLIST_ADD_BUTTON_ID,
  PLAYLIST_PLAYLIST_BUTTON_INJECT_CONTAINER_SELECTOR,
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
import YTUtil from './util/yt';

const intervals: PluginInjectIntervals = {
  syncButton: null,
  leaveButton: null,
  queueAddButton: null,
  playlistAddButton: null,
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

  console.log(window.location.pathname);

  switch (window.location.pathname) {
    case '/watch':
      const sessionId = URLUtil.getSessionId();

      if (sessionId !== null) {
        return startInjectingWatchSessionItems(sessionId);
      }

      startInjectingWatchNonSessionItems();
      break;

    case '/playlist':
      intervals.playlistAddButton = injectButton(
        PLAYLIST_PLAYLIST_BUTTON_INJECT_CONTAINER_SELECTOR,
        PLAYLIST_ADD_BUTTON_ID,
        2,
        'Add to Queue',
        createPlusIcon(),
        () => {
          const playlistData = ($('ytd-item-section-renderer ytd-playlist-video-list-renderer').get(0) as any)
            .data as PlaylistData;

          if (playlistData === null || playlistData === undefined) {
            return createToast('No playlist to add found... :(');
          }

          Store.addPlaylist(playlistData);
          createToast('Playlist added to Sync Queue');
        }
      );

      break;
  }
}

/**
 * Inject all elements needed when not in a session
 *
 * @param urlParams The current window url parameters
 */
function startInjectingWatchNonSessionItems(): void {
  intervals.syncButton = injectButton(
    VIDEO_INFO_BUTTON_INJECT_CONTAINER_SELECTOR,
    CREATE_SYNC_BUTTON_ID,
    0,
    'Create Sync',
    createPlusIcon(),
    () => {
      const sessionId = WebsocketUtil.generateSessionId();
      location.hash = sessionId;

      ClipboardUtil.writeText(
        `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}#${sessionId}`
      );
      createToast('Sync Links copied to clipboard');
    }
  );

  intervals.queueAddButton = injectButton(
    VIDEO_INFO_BUTTON_INJECT_CONTAINER_SELECTOR,
    QUEUE_ADD_BUTTON_ID,
    1,
    'Add to Queue',
    createPlusIcon(),
    () => {
      Store.addElement(VideoUtil.getCurrentVideo());
      createToast('Video added to Sync Queue');
    }
  );

  intervals.playlistAddButton = injectButton(
    VIDEO_PLAYLIST_BUTTON_INJECT_CONTAINER_SELECTOR,
    PLAYLIST_ADD_BUTTON_ID,
    2,
    'Add to Queue',
    createPlusIcon(),
    () => {
      const playlistData = YTUtil.getPlaylistManager().getPlaylistData();

      if (playlistData === null) {
        return createToast('No playlist to add found... :(');
      }

      Store.addPlaylist(playlistData);
      createToast('Playlist added to Sync Queue');
    }
  );
}

/**
 * Inject all elements needed when in a session
 *
 * @param urlParams The current window url parameters
 * @param sessionId The session id
 */
function startInjectingWatchSessionItems(sessionId: string): void {
  intervals.leaveButton = injectButton(
    VIDEO_INFO_BUTTON_INJECT_CONTAINER_SELECTOR,
    LEAVE_SYNC_BUTTON_ID,
    0,
    'Leave Sync',
    createLeaveIcon(),
    () => {
      // No leave possible currently
      location.hash = '';
    }
  );

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
  containerSelector: string,
  id: string,
  insertAfter: number,
  text: string,
  icon: JQuery<HTMLElement>,
  cb: () => void
): NodeJS.Timeout {
  const handler = setInterval(() => {
    const container = $(containerSelector);
    $(`ytd-button-renderer#${id}`).remove();
    if (container.length === 1 && container.find(`#${id}`).length === 0) {
      injectYtRenderedButton(container, insertAfter, id, text, icon, cb);
      clearInterval(handler);
    }
  }, 500);

  return handler;
}
