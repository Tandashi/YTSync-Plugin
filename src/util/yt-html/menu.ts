/**
 * Create a <ytd-menu-renderer> Shell
 */
export function createYtMenuRendererShell(): JQuery<HTMLElement> {
  return $(`
    <ytd-menu-renderer class="style-scope ytd-playlist-panel-video-renderer">
  `);
}
