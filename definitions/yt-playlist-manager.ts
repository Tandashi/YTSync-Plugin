interface YTPlaylistManager {
  getPlaylistData(): PlaylistData | null | undefined;
}

interface PlaylistData {
  contents: PlaylistVideo[];
}

interface PlaylistVideo {
  playlistPanelVideoRenderer?: PlaylistPanelVideoRenderer;
  playlistVideoRenderer?: PlaylistVideoRenderer;
}

interface PlaylistPanelVideoRenderer {
  title: PlaylistTitle;
  shortBylineText: Runs<TextRun>;
  videoId: string;
}

interface PlaylistVideoRenderer {
  title: Runs<TextRun>;
  shortBylineText: Runs<TextRun>;
  videoId: string;
}

interface PlaylistTitle {
  simpleText: string;
}

interface Runs<T> {
  runs: T[];
}

interface TextRun {
  text: string;
}
