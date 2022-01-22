export const CREATE_SYNC_BUTTON_ID = 'create-sync-button';
export const LEAVE_SYNC_BUTTON_ID = 'leave-sync-button';
export const QUEUE_ADD_BUTTON_ID = 'queue-add-button';
export const PLAYLIST_ADD_BUTTON_ID = 'playlist-add-button';

// The Badge ids are the ids on the server for the badge images
export const BADGE_MEMBER_ID = 'member';
export const BADGE_MODERATOR_ID = 'moderator';
export const BADGE_SUB_HOST_ID = 'sub-host';

export const NON_PLAYLIST_CONTAINER_SELECTOR = 'div#secondary div#secondary-inner';
export const VIDEO_INFO_BUTTON_INJECT_CONTAINER_SELECTOR =
  'div#primary > div#primary-inner > div#info > div#info-contents > ytd-video-primary-info-renderer > div#container > div#info ytd-menu-renderer';
export const VIDEO_PLAYLIST_BUTTON_INJECT_CONTAINER_SELECTOR =
  'div#secondary ytd-playlist-panel-renderer div#playlist-actions > div#end-actions';
export const PLAYLIST_PLAYLIST_BUTTON_INJECT_CONTAINER_SELECTOR = 'ytd-playlist-sidebar-primary-info-renderer div#menu';

export const Reactions: Reaction[] = [
  { id: 'play', symbol: '▶️', tooltip: 'Emoji Play', text: '' },
  { id: 'pause', symbol: '⏸️', tooltip: 'Emoji Pause', text: '' },
  { id: 'rewind', symbol: '⏪', tooltip: 'Emoji Rewind', text: '' },
  { id: 'forward', symbol: '⏩', tooltip: 'Emoji Forward', text: '' },
  { id: 'grin', symbol: '😀', tooltip: 'Emoji Grin', text: '' },
  { id: 'tears-of-joy', symbol: '😂', tooltip: 'Emoji Tears of Joy', text: '' },
  { id: 'exploding-head', symbol: '🤯', tooltip: 'Emoji Exploding Head', text: '' },
  { id: 'scream-in-fear', symbol: '😱', tooltip: 'Emoji Scream in Feat', text: '' },
  { id: 'anxious', symbol: '😰', tooltip: 'Emoji Anxious', text: '' },
  { id: 'partying-face', symbol: '🥳', tooltip: 'Emoji Partying Face', text: '' },
  { id: 'drooling', symbol: '🤤', tooltip: 'Emoji Drooling', text: '' },
  { id: 'yawn', symbol: '🥱', tooltip: 'Emoji Yawn', text: '' },
  { id: 'vomiting', symbol: '🤮', tooltip: 'Emoji Vomiting', text: '' },
  { id: 'thinking', symbol: '🤔', tooltip: 'Emoji Thinking', text: '' },
  { id: 'flushed', symbol: '😳', tooltip: 'Emoji Flushed', text: '' },
  { id: 'no-mouth', symbol: '😶', tooltip: 'Emoji No Mouth', text: '' },
  { id: 'ok-hand', symbol: '👌', tooltip: 'Emoji Ok Hand', text: '' },
  { id: 'popcorn', symbol: '🍿', tooltip: 'Emoji Popcorn', text: '' },
  { id: 'skull', symbol: '💀', tooltip: 'Emoji Skull', text: '' },
  { id: 'brain', symbol: '🧠', tooltip: 'Emoji Brain', text: '' },
];

export const ReactionsMap: { [id: string]: Reaction } = Reactions.reduce((acc, cur) => {
  acc[cur.id] = cur;
  return acc;
}, {});
