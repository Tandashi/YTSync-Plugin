export const SESSION_ID = 'syncId';
export const QUEUE_ID = 'syncQueue';
export const SETTINGS_ID = 'syncSettings';

export const CREATE_SYNC_BUTTON_ID = 'create-sync-button';
export const LEAVE_SYNC_BUTTON_ID = 'leave-sync-button';
export const QUEUE_ADD_BUTTON_ID = 'queue-add-button';

export const QUEUE_CONTAINER_SELECTOR = 'div#secondary #playlist';
export const ROOM_INFO_CONTAINER_SELECTOR = 'div#secondary div#secondary-inner';
export const REACTIONS_CONTAINER_SELECTOR = 'div#secondary div#secondary-inner';

export const REACTION_TIME_TILL_REMOVE = 8000;
export const REACTION_FADE_IN_TIME = 600;

export const Reactions: Reaction[] = [
  { id: 'grin', symbol: '😀', text: '' },
  { id: 'tears-of-joy', symbol: '😂', text: '' },
  { id: 'exploding-head', symbol: '🤯', text: '' },
  { id: 'scream-in-fear', symbol: '😱', text: '' },
  { id: 'anxious', symbol: '😰', text: '' },
  { id: 'partying-face', symbol: '🥳', text: '' },
  { id: 'drooling', symbol: '🤤', text: '' },
  { id: 'yawn', symbol: '🥱', text: '' },
  { id: 'vomiting', symbol: '🤮', text: '' },
  { id: 'thinking', symbol: '🤔', text: '' },
  { id: 'flushed', symbol: '😳', text: '' },
  { id: 'no-mouth', symbol: '😶', text: '' },
  { id: 'ok-hand', symbol: '👌', text: '' },
  { id: 'popcorn', symbol: '🍿', text: '' },
  { id: 'skull', symbol: '💀', text: '' },
  { id: 'brain', symbol: '🧠', text: '' },
];

export const ReactionsMap: { [id: string]: Reaction; } = Reactions.reduce((acc, cur) => {
  acc[cur.id] = cur;
  return acc;
}, {});

export const DEFAULT_SETTINGS: Settings = {
  showReactions: true
};