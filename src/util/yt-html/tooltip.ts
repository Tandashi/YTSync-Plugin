/**
 * Create a <paper-tooltip> Shell. You still need to set the Text inside!
 *
 * @param id The tooltip Id
 * @param forId The element Id the tooltip is for
 * @param text The tooltip text
 */
export function createPaperTooltipShell(id: string, forId: string, text: string): JQuery<HTMLElement> {
  return $(`
    <tp-yt-paper-tooltip class="style-scope ytd-toggle-button-renderer" role="tooltip" tabindex="-1" style="inset: 44px auto auto 0px;">
      ${text}
    </tp-yt-paper-tooltip>
  `);
}