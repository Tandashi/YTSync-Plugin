/**
 * Create a <paper-tooltip> Shell. You still need to set the Text inside!
 *
 * @param id The tooltip Id
 * @param forId The element Id the tooltip is for
 * @param text The tooltip text
 */
export function createPaperTooltipShell(id: string, forId: string, text: string): JQuery<HTMLElement> {
  return $(`
    <paper-tooltip id="${id}" for="${forId}">
      ${text}
    </paper-tooltip>
  `);
}