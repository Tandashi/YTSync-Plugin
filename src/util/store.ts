import { StorageId } from './consts';

export default class Store {
    /**
     * Get the currently stored videos
     */
    public static getQueue(): Video[] {
        const json = GM_getValue(StorageId, '[]');
        return JSON.parse(json);
    }

    /**
     * Add a video to the Store
     *
     * @param video The video to add to the Store
     */
    public static addElement(video: Video): void {
        const data = Store.getQueue();
        data.push(video);

        Store.setQueue(data);
    }

    /**
     * Remove a video from the Store
     *
     * @param video The video that should be removed
     */
    public static removeElement(video: Video): void {
        const data = Store.getQueue().filter((v) => v.videoId !== video.videoId);
        Store.setQueue(data);
    }

    /**
     * Set the currently stored videos
     *
     * @param data The video that should be set
     */
    private static setQueue(data: Video[]): void {
        GM_setValue(StorageId, JSON.stringify(data));
    }
}