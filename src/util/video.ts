import YTUtil from './yt';

export default class VideoUtil {
  /**
   * Get current Youtube Page as Video Element
   */
  public static getCurrentVideo(): Video {
    const app = YTUtil.getApp();

    const { videoId, title, author } = app.data.playerResponse.videoDetails;

    if (videoId === null)
      return;

    return {
      videoId,
      title,
      byline: author
    };
  }
}