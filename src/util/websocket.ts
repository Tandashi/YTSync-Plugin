export default class WebsocketUtil {
    /**
     * Generate a random Session ID
     */
    public static generateSessionId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}