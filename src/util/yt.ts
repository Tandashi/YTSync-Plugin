const YT_APP_SELECTOR = 'ytd-app';
const YT_PLAYER_SELECTOR = 'ytd-player';
const YT_PLAYLIST_MANAGER_SELECTOR = 'yt-playlist-manager';

export default class YTUtil {
  /**
   * Get the YTApp
   */
  public static getApp(): YTApp {
    const a: any = $(YT_APP_SELECTOR).get(0);
    return a;
  }

  /**
   * Get the YT Player
   */
  public static getPlayer(): YTPlayer | null {
    const p: any = $(YT_PLAYER_SELECTOR).get(0);
    return p !== undefined && p !== null ? (p.getPlayer() as YTPlayer) : null;
  }

  /**
   * Get the YT Playlist Manager
   */
  public static getPlaylistManager(): YTPlaylistManager | null {
    return $(YT_PLAYLIST_MANAGER_SELECTOR).get(0) as unknown as YTPlaylistManager;
  }

  public static navigateToVideo(videoId: string, sessionId: string): void {
    const app = this.getApp();
    app.onYtNavigate({
      detail: {
        endpoint: {
          commandMetadata: {
            webCommandMetadata: {
              url: `/watch?v=${videoId}#${sessionId}`,
            },
          },
          watchEndpoint: {
            videoId,
          },
        },
      },
    });

    const player = this.getPlayer();
    player.cueVideoById(videoId);
  }
}
