export default class ClipboardUtil {
  /**
   * Write text to the clipboard.
   *
   * @param text The text to write to the clipboard
   */
  public static writeText(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
