import { InjectAction } from '../../enum/action';
import { NON_PLAYLIST_CONTAINER_SELECTOR } from '../consts';
import { injectYtPlaylistPanelRenderer, PlaylistPanelRendererElement } from './playlist';

const ROOM_INFO_CONTAINER_ID = 'room-info';

/**
 * Inject a empty room info shell using a <ytd-playlist-panel-renderer>.
 *
 * @param title The title of the room info panel
 * @param description The description of the room info panel
 * @param collapsible If the room info should be collapsible
 * @param collapsed If the room info should be initally collapsed
 * @param cb The function that should be called when the autoplay toggle gets clicked
 *
 * @return The created <ytd-playlist-panel-renderer>
 */
export function injectRoomInfoPanel(
  title: string,
  description: string,
  collapsible: boolean,
  collapsed: boolean,
  onCollapseChange: (state: boolean) => void
): JQuery<PlaylistPanelRendererElement> {
  return injectYtPlaylistPanelRenderer(
    NON_PLAYLIST_CONTAINER_SELECTOR,
    ROOM_INFO_CONTAINER_ID,
    title,
    description,
    collapsible,
    collapsed,
    onCollapseChange,
    InjectAction.APPEND
  );
}
