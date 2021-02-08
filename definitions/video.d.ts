interface Video {
  videoId: string;
  title: string;
  byline: string;
}

/**
 * @param videos The videos in the Queue
 * @param video The currently playing video
 */
interface QueueMessageData {
  videos: Video[],
  video: Video
}