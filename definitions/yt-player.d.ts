interface YTPlayer extends YT.Player {
  getVideoData(): YTPlayerVideoData;
}

interface YTPlayerVideoData {
  author: string;
  title: string;
  video_id: string;
}