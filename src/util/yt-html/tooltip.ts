/**
 * Create a <paper-tooltip> Shell.
 *
 * @param text The tooltip text
 */
export function createPaperTooltipShell(text: string): JQuery<HTMLElement> {
  return $(`
    <tp-yt-paper-tooltip class="style-scope ytd-toggle-button-renderer" role="tooltip" tabindex="-1" style="inset: 44px auto auto 0px;">
      ${text}
    </tp-yt-paper-tooltip>
  `);
}
