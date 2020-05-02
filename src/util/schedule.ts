import Store from "./store";

export default class ScheduleUtil {
    /**
     * Start a "schedule" that checks if the video currently played by the YT.Player was seeked.
     *
     * @param player The player that should be checked for seeks
     * @param cb The function that should be called if a seek was detected
     * @param interval The interval in which the player should be checked for seeks. Unit: milliseconds. Default: 1000
     * @param margin The difference in time the player is allowed to have. Unit: seconds. Default: 0.5
     *
     * @see https://stackoverflow.com/questions/29293877/how-to-listen-to-seek-event-in-youtube-embed-api
     *
     * @returns A function which stopps the "scheduler"
     */
    public static startSeekSchedule(player: YT.Player, cb: () => void, interval: number = 1000, margin: number = 0.5): () => void {
        let lastTime = -1;

        const checkPlayerTime = () => {
            if (lastTime !== -1) {
                const time = player.getCurrentTime();

                // Expecting X second interval, with Y ms margin
                if (Math.abs(time - lastTime - (interval / 1000)) > margin) {
                    // There was a seek occuring
                    cb();
                }
            }
            lastTime = player.getCurrentTime();
        };

        const handler = setInterval(checkPlayerTime, interval);
        return () => {
            clearInterval(handler);
        };
    }


    /**
     * Start a "schedule" that checks if the URL has changed.
     *
     * @param cb The function that should be called when a URL change was detected
     * @param interval The interval in which the URL should be checked for changes. Unit: milliseconds. Default: 1000
     *
     * @returns A function which stopps the "scheduler"
     */
    public static startUrlChangeSchedule(cb: URLChangeCallback, interval: number = 1000): () => void {
        let old: Location = JSON.parse(JSON.stringify(window.location));

        const checkURL = () => {
            const current = window.location;

            // Check if the URL has changed
            if (old.href !== current.href) {
                // URL change occured
                cb(old, current);
            }

            old = JSON.parse(JSON.stringify(current));
        };

        const handler = setInterval(checkURL, interval);
        return () => {
            clearInterval(handler);
        };
    }

    /**
     * Start a "schedule" that checks the Store for Videos.
     *
     * @param cb The function that should be called when a Video has been found in the Store
     * @param interval The interval in which the Store should be checked for Videos. Unit: milliseconds. Default: 1000
     *
     * @returns A function which stopps the "scheduler"
     */
    public static startQueueStoreSchedule(cb: QueueStoreCallback, interval: number = 1000): () => void {
        const checkQueue = () => {
            const data = Store.getQueue();

            for(const vobj of data) {
                cb(vobj);
                Store.removeElement(vobj);
            }
        };

        const handler = setInterval(checkQueue, interval);
        return () => {
            clearInterval(handler);
        };
    }
}