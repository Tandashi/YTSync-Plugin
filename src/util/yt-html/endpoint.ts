/**
 * Create a <a class="yt-simple-endoint"> Shell.
 */
export function createYtSimpleEndpointShell(): JQuery<HTMLElement> {
  return $(`
    <a class="yt-simple-endpoint style-scope ytd-button-renderer" tabindex="-1">
  `);
}
