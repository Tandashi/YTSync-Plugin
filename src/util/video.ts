import YTUtil from './yt';

export default class VideoUtil {
  /**
   * Get current Youtube Page as Video Element
   */
  public static getCurrentVideo(): Video {
    const player = YTUtil.getPlayer();
    const { video_id, title, author } = player.getVideoData();

    if (video_id === null)
      return;

    return {
      videoId: video_id,
      title,
      byline: author
    };
  }
}