
export default class VideoUtil {
    /**
     * Get current Youtube Page as Video Element
     */
    public static getCurrentVideo(): Video {
        const params = new URLSearchParams(window.location.search);
        const videoId = params.get('v');

        if (videoId === null)
            return;

        return {
            videoId,
            title: $('ytd-video-primary-info-renderer h1 yt-formatted-string').text(),
            byline: $('ytd-channel-name a').text()
        };
    }
}