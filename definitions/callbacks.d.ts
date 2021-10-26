/**
 * @param o The old window Location
 * @param n The new window Location
 */
type URLChangeCallback = (o: Location, n: Location) => void;

/**
 * @param video The Video from the Store
 */
type QueueStoreCallback = (video: Video) => void;

/**
 * @param player The found YtPlayer
 */
type YtPlayerCallback = (player: YTPlayer) => void;

type ScheduleClear = () => void;
