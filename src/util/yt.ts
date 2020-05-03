export default class YTUtil {
    public static getApp(): YTApp {
        const a: any = $('ytd-app').get(0);
        return a;
    }
}