export const SessionId = 'syncId';
export const StorageId = 'syncStore';

export const CreateSyncButtonId = 'create-sync-button';
export const LeaveSyncButtonId = 'leave-sync-button';
export const QueueAddButtonId = 'queue-add-button';

export const QueueContainerSelector = 'div#secondary #playlist';
export const RoomInfoContainerSelector = 'div#secondary div#secondary-inner';
export const ReactionsContainerSelector = 'div#secondary div#secondary-inner';

export const ReactionTimeTillRemove = 5000;
export const ReactionFadeInTime = 600;

export const Reactions: Reaction[] = [
    { id: 'grin', symbol: '😀', text: 'Grin' },
    { id: 'tears-of-joy', symbol: '😂', text: 'Hahaha' },
    { id: 'popcorn', symbol: '🍿', text: 'Crunch!' },
    { id: 'exploding-head', symbol: '🤯', text: 'Boom!' },
    { id: 'partying-face', symbol: '🥳', text: '*Pop*' },
    { id: 'scream-in-fear', symbol: '😱', text: 'Huuuh' }
];

export const ReactionsMap: { [id: string]: Reaction; } = Reactions.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
}, {});