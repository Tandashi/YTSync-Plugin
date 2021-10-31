import { injectEmptyPlaylistShell, PlaylistPanelRendererElement } from './playlist';

/**
 * Inject a empty room info shell using a <ytd-playlist-panel-renderer>.
 *
 * @param title The title of the room info panel
 * @param description The description of the room info panel
 * @param collapsible If the room info should be collapsible
 * @param collapsed If the room info should be initally collapsed
 *
 * @return The created <ytd-playlist-panel-renderer>
 */
export function injectQueuePanel(
  title: string,
  description: string,
  collapsible: boolean,
  collapsed: boolean,
  onCollapseChange: (state: boolean) => void
): JQuery<PlaylistPanelRendererElement> {
  return injectEmptyPlaylistShell(title, description, collapsible, collapsed, onCollapseChange);
}
