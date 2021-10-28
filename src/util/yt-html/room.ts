import { InjectAction } from '../../enum/action';
import { createPaperToggleButtonShell } from './button';
import { injectYtPlaylistPanelRenderer } from './playlist';
import { createPaperTooltipShell } from './tooltip';

const ROOM_INFO_CONTAINER_ID = 'room-info';

export const AUTOPLAY_TOGGLE_ID = 'autoplay-toggle';

export const ROOM_INFO_CONTAINER_SELECTOR = 'div#secondary div#secondary-inner';

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
export function injectEmptyRoomInfoShell(
  title: string,
  description: string,
  collapsible: boolean,
  collapsed: boolean
): JQuery<HTMLElement> {
  return injectYtPlaylistPanelRenderer(
    ROOM_INFO_CONTAINER_SELECTOR,
    ROOM_INFO_CONTAINER_ID,
    title,
    description,
    collapsible,
    collapsed,
    InjectAction.APPEND
  );
}
