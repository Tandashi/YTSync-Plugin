export default class URLUtil {

  public static getVideoId(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  public static getSessionId(): string | null {
    return this.getSessionIdWithLocation(window.location);
  }

  public static getSessionIdWithLocation(location: Location): string | null {
    const sessionId = location.hash.substr(1).replace('=', '');
    return sessionId === '' ? null : sessionId;
  }

}