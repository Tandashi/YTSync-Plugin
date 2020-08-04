export const STORAGE_SESSION_ID = 'syncId';
export const STORAGE_QUEUE_ID = 'syncQueue';
export const STORAGE_SETTINGS_ID = 'syncSettings';

export const CREATE_SYNC_BUTTON_ID = 'create-sync-button';
export const LEAVE_SYNC_BUTTON_ID = 'leave-sync-button';
export const QUEUE_ADD_BUTTON_ID = 'queue-add-button';

export const REACTION_OVERLAY_ID = 'reaction-overlay';
export const ROOM_INFO_CONTAINER_ID = 'room-info';

export const AUTOPLAY_TOGGLE_ID = 'autoplay-toggle';
export const AUTOPLAY_TOGGLE_TOOLTIP_ID = 'autoplay-toggle-tooltip';

export const REACTION_TOGGLE_ID = 'reaction-toggle';
export const REACTION_TOGGLE_TOOLTIP_ID = 'reaction-toggle-tooltip';

export const YT_APP_SELECTOR = 'ytd-app';
export const YT_PLAYER_SELECTOR = 'ytd-player';
export const YT_VIDEO_TITLE_SELECTOR = 'ytd-video-primary-info-renderer h1 yt-formatted-string';
export const YT_VIDEO_BYLINE_SELECTOR = 'ytd-channel-name a';

// The Badge ids are the ids on the server for the badge images
export const BADGE_PROMOTE_ID = 'promote';
export const BADGE_UNPROMOTE_ID = 'unpromote';

export const BUTTON_INJECT_CONTAINER_SELECTOR = 'div#primary > div#primary-inner > div#info > div#info-contents > ytd-video-primary-info-renderer > div#container > div#info ytd-menu-renderer div#top-level-buttons';
export const QUEUE_CONTAINER_SELECTOR = 'div#secondary #playlist';
export const ROOM_INFO_CONTAINER_SELECTOR = 'div#secondary div#secondary-inner';
export const REACTIONS_CONTAINER_SELECTOR = 'div#secondary div#secondary-inner';

export const REACTION_TIME_TILL_REMOVE = 8000;
export const REACTION_FADE_IN_TIME = 600;

export function getReactionId(reaction: Reaction): string {
  return `emoji-${reaction.id}`;
}

export function getReactionTooltipId(reaction: Reaction): string {
  return `emoji-${reaction.id}-tooltip`;
}

export const Reactions: Reaction[] = [
  { id: 'play',           symbol: '▶️', tooltip: 'Emoji Play',            text: '' },
  { id: 'pause',          symbol: '⏸️', tooltip: 'Emoji Pause',           text: '' },
  { id: 'rewind',         symbol: '⏪', tooltip: 'Emoji Rewind',          text: '' },
  { id: 'forward',        symbol: '⏩', tooltip: 'Emoji Forward',         text: '' },
  { id: 'grin',           symbol: '😀', tooltip: 'Emoji Grin',            text: '' },
  { id: 'tears-of-joy',   symbol: '😂', tooltip: 'Emoji Tears of Joy',    text: '' },
  { id: 'exploding-head', symbol: '🤯', tooltip: 'Emoji Exploding Head',  text: '' },
  { id: 'scream-in-fear', symbol: '😱', tooltip: 'Emoji Scream in Feat',  text: '' },
  { id: 'anxious',        symbol: '😰', tooltip: 'Emoji Anxious',         text: '' },
  { id: 'partying-face',  symbol: '🥳', tooltip: 'Emoji Partying Face',   text: '' },
  { id: 'drooling',       symbol: '🤤', tooltip: 'Emoji Drooling',        text: '' },
  { id: 'yawn',           symbol: '🥱', tooltip: 'Emoji Yawn',            text: '' },
  { id: 'vomiting',       symbol: '🤮', tooltip: 'Emoji Vomiting',        text: '' },
  { id: 'thinking',       symbol: '🤔', tooltip: 'Emoji Thinking',        text: '' },
  { id: 'flushed',        symbol: '😳', tooltip: 'Emoji Flushed',         text: '' },
  { id: 'no-mouth',       symbol: '😶', tooltip: 'Emoji No Mouth',        text: '' },
  { id: 'ok-hand',        symbol: '👌', tooltip: 'Emoji Ok Hand',         text: '' },
  { id: 'popcorn',        symbol: '🍿', tooltip: 'Emoji Popcorn',         text: '' },
  { id: 'skull',          symbol: '💀', tooltip: 'Emoji Skull',           text: '' },
  { id: 'brain',          symbol: '🧠', tooltip: 'Emoji Brain',           text: '' },
];

export const ReactionsMap: { [id: string]: Reaction; } = Reactions.reduce((acc, cur) => {
  acc[cur.id] = cur;
  return acc;
}, {});

export const DEFAULT_SETTINGS: Settings = {
  showReactions: true
};