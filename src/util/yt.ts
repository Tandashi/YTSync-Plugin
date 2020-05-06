export default class YTUtil {
    /**
     * Get the YTApp
     */
    public static getApp(): YTApp {
        const a: any = $('ytd-app').get(0);
        return a;
    }

    /**
     * Get the YT Player
     */
    public static getPlayer(): YT.Player {
        const p: any = $('ytd-player').get(0);
        return p.getPlayer() as YT.Player;
    }
}