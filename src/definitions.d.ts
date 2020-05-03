interface PlayerOptions {
    connection: {
        protocol: string;
        host: string;
        port: string;
    };
}

interface Video {
    videoId: string;
    title: string;
    byline: string;
}

interface PluginInjectIntervals {
    syncButton: NodeJS.Timeout | null;
    leaveButton: NodeJS.Timeout| null
    removeUpnext: NodeJS.Timeout | null
    queueInject: NodeJS.Timeout | null
    queueAddButton: NodeJS.Timeout | null
}

/**
 * @param videos The videos in the Queue
 * @param video The currently playing video
 */
interface QueueMessageData {
    videos: Video[],
    video: Video
}

/**
 * @param o The old window Location
 * @param n The new window Location
 */
type URLChangeCallback = (o: Location, n: Location) => void;

/**
 * @param video The Video from the Store
 */
type QueueStoreCallback = (video: Video) => void;