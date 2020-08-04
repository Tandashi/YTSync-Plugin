import { YT_VIDEO_BYLINE_SELECTOR, YT_VIDEO_TITLE_SELECTOR } from './consts';

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
      title: $(YT_VIDEO_TITLE_SELECTOR).text(),
      byline: $(YT_VIDEO_BYLINE_SELECTOR).text()
    };
  }
}