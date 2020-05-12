export const SessionId = 'syncId';
export const StorageId = 'syncStore';

export const CreateSyncButtonId = 'create-sync-button';
export const LeaveSyncButtonId = 'leave-sync-button';
export const QueueAddButtonId = 'queue-add-button';

export const QueueContainerSelector = 'div#secondary #playlist';
export const RoomInfoContainerSelector = 'div#secondary div#secondary-inner';
export const ReactionsContainerSelector = 'div#secondary div#secondary-inner';

export const ReactionTimeTillRemove = 8000;
export const ReactionFadeInTime = 600;

export const Reactions: Reaction[] = [
    { id: 'grin', symbol: '😀', text: '' },
    { id: 'tears-of-joy', symbol: '😂', text: '' },
    { id: 'popcorn', symbol: '🍿', text: '' },
    { id: 'exploding-head', symbol: '🤯', text: '' },
    { id: 'partying-face', symbol: '🥳', text: '' },
    { id: 'scream-in-fear', symbol: '😱', text: '' },
    { id: 'thinking', symbol: '🤔', text: '' },
    { id: 'drooling', symbol: '🤤', text: '' },
    { id: 'vomiting', symbol: '🤮', text: '' },
    { id: 'skull', symbol: '💀', text: '' },
    { id: 'yawn', symbol: '🥱', text: '' },
    { id: 'brain', symbol: '🧠', text: '' },
    { id: 'ok-hand', symbol: '👌', text: '' },
    { id: 'anxious', symbol: '😰', text: '' }
];

export const ReactionsMap: { [id: string]: Reaction; } = Reactions.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
}, {});