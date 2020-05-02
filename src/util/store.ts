import { QueueId } from "./consts";

export default class Store {
    public static getQueue(): Video[] {
        const json = GM_getValue(QueueId, "[]");
        return JSON.parse(json);
    }

    public static addElement(video: Video): void {
        const data = Store.getQueue();
        data.push(video);

        Store.setQueue(data);
    }

    public static removeElement(video: Video): void {
        const data = Store.getQueue().filter((v) => v.videoId !== video.videoId);
        Store.setQueue(data);
    }

    private static setQueue(data: Video[]): void {
        GM_setValue(QueueId, JSON.stringify(data));
    }
}