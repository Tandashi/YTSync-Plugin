interface YTPlayer extends YT.Player {
  setAutonav(value: boolean): void;
  getVideoData(): YTPlayerVideoData;
}

interface YTPlayerVideoData {
  author: string;
  title: string;
  video_id: string;
}
