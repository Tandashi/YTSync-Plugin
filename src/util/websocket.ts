export function generateRoomId(): string {
    return Math.random().toString(36).substring(12);
}